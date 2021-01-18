/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { MyCarAsset } from './my-car-asset';

@Info({title: 'MyCarAssetContract', description: 'My Smart Contract' })
export class MyCarAssetContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async myCarAssetExists(ctx: Context, myCarAssetId: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(myCarAssetId);
        return (!!buffer && buffer.length > 0);
    }

    @Transaction()
    public async createMyCarAsset(ctx: Context, myCarAssetId: string, value: string): Promise<void> {
        const exists = await this.myCarAssetExists(ctx, myCarAssetId);
        if (exists) {
            throw new Error(`The my car asset ${myCarAssetId} already exists`);
        }
        const myCarAsset = new MyCarAsset();
        myCarAsset.value = value;
        const buffer = Buffer.from(JSON.stringify(myCarAsset));
        await ctx.stub.putState(myCarAssetId, buffer);
    }

    @Transaction(false)
    @Returns('MyCarAsset')
    public async readMyCarAsset(ctx: Context, myCarAssetId: string): Promise<MyCarAsset> {
        const exists = await this.myCarAssetExists(ctx, myCarAssetId);
        if (!exists) {
            throw new Error(`The my car asset ${myCarAssetId} does not exist`);
        }
        const buffer = await ctx.stub.getState(myCarAssetId);
        const myCarAsset = JSON.parse(buffer.toString()) as MyCarAsset;
        return myCarAsset;
    }

    @Transaction()
    public async updateMyCarAsset(ctx: Context, myCarAssetId: string, newValue: string): Promise<void> {
        const exists = await this.myCarAssetExists(ctx, myCarAssetId);
        if (!exists) {
            throw new Error(`The my car asset ${myCarAssetId} does not exist`);
        }
        const myCarAsset = new MyCarAsset();
        myCarAsset.value = newValue;
        const buffer = Buffer.from(JSON.stringify(myCarAsset));
        await ctx.stub.putState(myCarAssetId, buffer);
    }

    @Transaction()
    public async deleteMyCarAsset(ctx: Context, myCarAssetId: string): Promise<void> {
        const exists = await this.myCarAssetExists(ctx, myCarAssetId);
        if (!exists) {
            throw new Error(`The my car asset ${myCarAssetId} does not exist`);
        }
        await ctx.stub.deleteState(myCarAssetId);
    }

}
