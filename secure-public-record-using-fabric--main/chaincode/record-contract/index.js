"use strict";

const { Contract } = require("fabric-contract-api");

class PublicRecordContract extends Contract {
  async initLedger(ctx) {
    return "Public record ledger initialized";
  }

  async createRecord(ctx, recordId, hash, transactionId, timestamp, verificationStatus, securityMethod) {
    const exists = await this.recordExists(ctx, recordId);
    if (exists) {
      throw new Error(`Record ${recordId} already exists`);
    }

    const record = {
      recordId,
      hash,
      transactionId,
      timestamp,
      verificationStatus,
      securityMethod,
      docType: "publicRecord"
    };

    await ctx.stub.putState(recordId, Buffer.from(JSON.stringify(record)));
    return JSON.stringify(record);
  }

  async readRecord(ctx, recordId) {
    const bytes = await ctx.stub.getState(recordId);
    if (!bytes || bytes.length === 0) {
      throw new Error(`Record ${recordId} does not exist`);
    }
    return bytes.toString();
  }

  async updateVerificationStatus(ctx, recordId, verificationStatus) {
    const record = JSON.parse(await this.readRecord(ctx, recordId));
    record.verificationStatus = verificationStatus;
    await ctx.stub.putState(recordId, Buffer.from(JSON.stringify(record)));
    return JSON.stringify(record);
  }

  async recordExists(ctx, recordId) {
    const bytes = await ctx.stub.getState(recordId);
    return bytes && bytes.length > 0;
  }

  async queryAllRecords(ctx) {
    const iterator = await ctx.stub.getStateByRange("", "");
    const records = [];

    while (true) {
      const result = await iterator.next();
      if (result.value && result.value.value.toString()) {
        records.push(JSON.parse(result.value.value.toString("utf8")));
      }
      if (result.done) {
        await iterator.close();
        return JSON.stringify(records);
      }
    }
  }
}

module.exports.contracts = [PublicRecordContract];
