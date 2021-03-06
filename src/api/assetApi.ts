import {RestApi} from './index';
import {ApiResponse} from './types/index';

export interface AssetApi {
  fetchAssets: () => ApiResponse<any>;
  fetchAvailableAssets: () => ApiResponse<any>;
  fetchAssetInstruments: () => ApiResponse<any>;
  fetchAssetAddress: (id: string) => ApiResponse<any>;
  fetchRates: () => ApiResponse<any>;
  fetchCategories: () => ApiResponse<any>;
  fetchDescription: () => ApiResponse<any>;
  fetchPaymentMethods: () => ApiResponse<any>;
}

export class RestAssetApi extends RestApi implements AssetApi {
  fetchAssets = () => this.get('/assets');
  fetchAvailableAssets = () => this.get('/assets/available');
  fetchAssetInstruments = () => this.get('/assetpairs');
  fetchAssetAddress = (id: string) =>
    this.get(`/deposits/crypto/${id}/address`);
  fetchRates = () => this.get('/markets');

  fetchCategories = () => this.get('/assets/categories');

  fetchDescription = () => this.get('/assets/description');
  fetchPaymentMethods = () => this.get('/paymentmethods');
}

export default RestAssetApi;
