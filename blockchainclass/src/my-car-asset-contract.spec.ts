/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { MyCarAssetContract } from '.';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext implements Context {
    public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(ClientIdentity);
    public logging = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
     };
}

describe('MyCarAssetContract', () => {

    let contract: MyCarAssetContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new MyCarAssetContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"my car asset 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"my car asset 1002 value"}'));
    });

    describe('#myCarAssetExists', () => {

        it('should return true for a my car asset', async () => {
            await contract.myCarAssetExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a my car asset that does not exist', async () => {
            await contract.myCarAssetExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createMyCarAsset', () => {

        it('should create a my car asset', async () => {
            await contract.createMyCarAsset(ctx, '1003', 'my car asset 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"my car asset 1003 value"}'));
        });

        it('should throw an error for a my car asset that already exists', async () => {
            await contract.createMyCarAsset(ctx, '1001', 'myvalue').should.be.rejectedWith(/The my car asset 1001 already exists/);
        });

    });

    describe('#readMyCarAsset', () => {

        it('should return a my car asset', async () => {
            await contract.readMyCarAsset(ctx, '1001').should.eventually.deep.equal({ value: 'my car asset 1001 value' });
        });

        it('should throw an error for a my car asset that does not exist', async () => {
            await contract.readMyCarAsset(ctx, '1003').should.be.rejectedWith(/The my car asset 1003 does not exist/);
        });

    });

    describe('#updateMyCarAsset', () => {

        it('should update a my car asset', async () => {
            await contract.updateMyCarAsset(ctx, '1001', 'my car asset 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"my car asset 1001 new value"}'));
        });

        it('should throw an error for a my car asset that does not exist', async () => {
            await contract.updateMyCarAsset(ctx, '1003', 'my car asset 1003 new value').should.be.rejectedWith(/The my car asset 1003 does not exist/);
        });

    });

    describe('#deleteMyCarAsset', () => {

        it('should delete a my car asset', async () => {
            await contract.deleteMyCarAsset(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a my car asset that does not exist', async () => {
            await contract.deleteMyCarAsset(ctx, '1003').should.be.rejectedWith(/The my car asset 1003 does not exist/);
        });

    });

});
