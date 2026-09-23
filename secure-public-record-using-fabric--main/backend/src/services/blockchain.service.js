import { nanoid } from "nanoid";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import os from "os";
import grpc from "@grpc/grpc-js";
import { connect, signers } from "@hyperledger/fabric-gateway";
import BlockchainTransaction from "../models/blockchain-transaction.model.js";

const channelName = process.env.FABRIC_CHANNEL_NAME || "mychannel";
const chaincodeName = process.env.FABRIC_CHAINCODE_NAME || "public-records";

function fabricEnabled() {
  return process.env.FABRIC_ENABLED === "true";
}

function localFallbackEnabled() {
  return process.env.FABRIC_FALLBACK_TO_LOCAL !== "false";
}

function wslDistroCandidates() {
  return [
    process.env.WSL_DISTRO_NAME,
    process.env.FABRIC_WSL_DISTRO,
    "Ubuntu",
    "Ubuntu-22.04"
  ].filter(Boolean);
}

function fabricPathCandidates(rawPath) {
  if (!rawPath) return [];
  const candidates = [rawPath];

  if (os.platform() === "win32" && rawPath.startsWith("/")) {
    const windowsPath = rawPath.replace(/\//g, "\\");
    for (const distro of wslDistroCandidates()) {
      candidates.push(`\\\\wsl.localhost\\${distro}${windowsPath}`);
      candidates.push(`\\\\wsl$\\${distro}${windowsPath}`);
    }
  }

  return [...new Set(candidates)];
}

async function resolveExistingPath(rawPath) {
  for (const candidate of fabricPathCandidates(rawPath)) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error(`Fabric path not found: ${rawPath}`);
}

async function readFabricFile(rawPath) {
  return fs.readFile(await resolveExistingPath(rawPath));
}

async function firstFile(directory) {
  const resolvedDirectory = await resolveExistingPath(directory);
  const entries = await fs.readdir(resolvedDirectory);
  const file = entries.find(entry => !entry.startsWith("."));
  if (!file) {
    throw new Error(`No private key found in ${resolvedDirectory}`);
  }
  return path.join(resolvedDirectory, file);
}

async function newGrpcConnection() {
  const tlsRootCert = await readFabricFile(process.env.FABRIC_TLS_CERT_PATH);
  const credentials = grpc.credentials.createSsl(tlsRootCert);
  return new grpc.Client(process.env.FABRIC_PEER_ENDPOINT, credentials, {
    "grpc.ssl_target_name_override": process.env.FABRIC_PEER_HOST_ALIAS
  });
}

async function newIdentity() {
  const credentials = await readFabricFile(process.env.FABRIC_CERT_PATH);
  return { mspId: process.env.FABRIC_MSP_ID || "Org1MSP", credentials };
}

async function newSigner() {
  const keyPath = await firstFile(process.env.FABRIC_KEY_DIRECTORY);
  const privateKeyPem = await fs.readFile(keyPath);
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  return signers.newPrivateKeySigner(privateKey);
}

async function getContract() {
  const client = await newGrpcConnection();
  const gateway = connect({
    client,
    identity: await newIdentity(),
    signer: await newSigner(),
    evaluateOptions: () => ({ deadline: Date.now() + 5000 }),
    endorseOptions: () => ({ deadline: Date.now() + 15000 }),
    submitOptions: () => ({ deadline: Date.now() + 5000 }),
    commitStatusOptions: () => ({ deadline: Date.now() + 60000 })
  });

  const network = gateway.getNetwork(channelName);
  const contract = network.getContract(chaincodeName);
  return { gateway, client, contract };
}

async function submitToFabric({ recordId, hash, securityMethod, timestamp }) {
  const { gateway, client, contract } = await getContract();
  try {
    const tx = contract.createTransaction("createRecord");
    const transactionId = tx.getTransactionId();
    await tx.submit(recordId, hash, transactionId, timestamp.toISOString(), "Pending", securityMethod);
    return transactionId;
  } finally {
    gateway.close();
    client.close();
  }
}

async function queryFabricRecord(recordId) {
  const { gateway, client, contract } = await getContract();
  try {
    const bytes = await contract.evaluateTransaction("readRecord", recordId);
    return JSON.parse(Buffer.from(bytes).toString("utf8"));
  } finally {
    gateway.close();
    client.close();
  }
}

async function updateFabricVerificationStatus(recordId, verificationStatus) {
  const { gateway, client, contract } = await getContract();
  try {
    await contract.submitTransaction("updateVerificationStatus", recordId, verificationStatus);
  } finally {
    gateway.close();
    client.close();
  }
}

export async function submitRecordHash({ recordId, hash, securityMethod }) {
  const latest = await BlockchainTransaction.findOne().sort({ blockNumber: -1 });
  const timestamp = new Date();
  let fabricTransactionId = null;
  if (fabricEnabled()) {
    try {
      fabricTransactionId = await submitToFabric({ recordId, hash, securityMethod, timestamp });
    } catch (error) {
      if (!localFallbackEnabled()) throw error;
      console.warn(`Fabric submit failed, using local transaction fallback: ${error.message}`);
    }
  }

  const transaction = await BlockchainTransaction.create({
    blockNumber: latest ? latest.blockNumber + 1 : 1,
    transactionId: fabricTransactionId || `TX-${Date.now()}-${nanoid(10).toUpperCase()}`,
    channel: channelName,
    recordId,
    hash,
    securityMethod,
    verificationStatus: "Pending",
    status: "VALID",
    timestamp
  });

  return transaction;
}

export async function getRecordHash(recordId) {
  if (fabricEnabled()) {
    try {
      const record = await queryFabricRecord(recordId);
      return {
        recordId: record.recordId,
        hash: record.hash,
        transactionId: record.transactionId,
        timestamp: record.timestamp,
        securityMethod: record.securityMethod,
        verificationStatus: record.verificationStatus
      };
    } catch (error) {
      if (!localFallbackEnabled()) throw error;
      console.warn(`Fabric query failed, using local transaction fallback: ${error.message}`);
    }
  }

  return BlockchainTransaction.findOne({ recordId }).sort({ createdAt: -1 });
}

export async function findAnchoredRecord(identifier) {
  const value = String(identifier || "").trim();
  if (!value) return null;

  const localRecord = await BlockchainTransaction.findOne({
    $or: [{ recordId: value }, { hash: value }]
  }).sort({ createdAt: -1 });

  if (localRecord) return localRecord;

  if (fabricEnabled()) {
    try {
      const record = await queryFabricRecord(value);
      return {
        recordId: record.recordId,
        hash: record.hash,
        transactionId: record.transactionId,
        timestamp: record.timestamp,
        securityMethod: record.securityMethod,
        verificationStatus: record.verificationStatus
      };
    } catch (error) {
      if (!localFallbackEnabled()) throw error;
      console.warn(`Fabric identifier lookup failed, using local fallback only: ${error.message}`);
    }
  }

  return null;
}

export async function updateVerificationStatus(recordId, verificationStatus) {
  if (fabricEnabled()) {
    try {
      await updateFabricVerificationStatus(recordId, verificationStatus);
    } catch (error) {
      if (!localFallbackEnabled()) throw error;
      console.warn(`Fabric status update failed, using local transaction fallback: ${error.message}`);
    }
  }

  return BlockchainTransaction.findOneAndUpdate(
    { recordId },
    { verificationStatus, status: verificationStatus === "Tampered" ? "INVALID" : "VALID" },
    { new: true, sort: { createdAt: -1 } }
  );
}
