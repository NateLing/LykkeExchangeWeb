import {computed, observable, runInAction} from 'mobx';
import {AssetApi} from '../api/assetApi';
import {AssetModel, InstrumentModel} from '../models/index';
import {RootStore} from './index';

export class AssetStore {
  @observable assets: AssetModel[] = [];
  @observable assetsAvailableForCreditCardDeposit: AssetModel[] = [];
  @observable assetsAvailableForCryptoDeposit: AssetModel[] = [];
  @observable categories: any[] = [];
  @observable instruments: InstrumentModel[] = [];

  @observable.shallow private availableAssets: string[] = [];

  @computed
  get baseAssets() {
    return this.assets
      .filter(a => this.availableAssets.indexOf(a.id) > -1)
      .filter(x => x.isBase);
  }

  constructor(readonly rootStore: RootStore, private api: AssetApi) {}

  getById = (id: string) => this.assets.find(a => a.id === id);

  getInstrumentById = (id: string) =>
    this.instruments.find(x => x.id.toLowerCase().includes(id.toLowerCase()));

  fetchAssets = async () => {
    await this.fetchCategories();
    await this.fetchAvailableAssets();
    const resp = await this.api.fetchAssets();
    const descriptionsResp = await this.api.fetchDescription();
    runInAction(() => {
      this.assets = resp.Assets.map(
        ({
          Id: id,
          Name,
          DisplayId: name,
          CategoryId,
          Accuracy: accuracy,
          IconUrl: iconUrl,
          IsBase
        }: any) => {
          const category = this.categories.find(x => x.Id === CategoryId) || {
            Name: 'Other',
            SortOrder: Number.MAX_SAFE_INTEGER
          };
          const description = descriptionsResp.Descriptions.find(
            (d: any) => d.Id === id
          ) || {
            Description: 'No description'
          };
          const asset = new AssetModel({
            accuracy,
            category: {
              id: category.Id,
              name: category.Name,
              sortOrder: category.SortOrder
            },
            description: description.Description,
            iconUrl,
            id,
            name: name || Name
          });
          asset.isBase = IsBase;
          return asset;
        }
      );
    });
  };

  fetchAvailableAssets = async () => {
    const resp = await this.api.fetchAvailableAssets();
    runInAction(() => {
      this.availableAssets = resp.AssetIds;
    });
  };

  fetchAssetsAvailableForDeposit = async () => {
    const resp = await this.api.fetchPaymentMethods();
    const fxpaygate = resp.PaymentMethods.find(
      (pm: any) => pm.Name === 'Fxpaygate'
    );
    const cryptos = resp.PaymentMethods.find(
      (pm: any) => pm.Name === 'Cryptos'
    );
    if (fxpaygate && fxpaygate.Available) {
      runInAction(() => {
        this.assetsAvailableForCreditCardDeposit = fxpaygate.Assets
          .map((assetId: string) => this.getById(assetId))
          .filter((asset: any) => asset);
      });
    }
    if (cryptos && cryptos.Available) {
      runInAction(() => {
        this.assetsAvailableForCryptoDeposit = cryptos.Assets
          .map((assetId: string) => this.getById(assetId))
          .filter((asset: any) => asset);
      });
    }
  };

  fetchAddress = async (assetId: string) => {
    const resp = await this.api.fetchAssetAddress(assetId);
    const asset = this.getById(assetId);
    if (asset) {
      asset.address = resp.Address;
    }
  };

  fetchInstruments = async () => {
    const resp = await this.api.fetchAssetInstruments();
    runInAction(() => {
      this.instruments = resp.AssetPairs
        .map(
          (ap: any) =>
            new InstrumentModel({
              accuracy: ap.Accuracy,
              baseAsset: this.getById(ap.BaseAssetId),
              id: ap.Id,
              invertedAccuracy: ap.InvertedAccuracy,
              name: ap.Name,
              quoteAsset: this.getById(ap.QuotingAssetId)
            })
        )
        .filter(
          (instrument: InstrumentModel, key: number, arr: InstrumentModel[]) =>
            arr.find(
              obj =>
                obj.baseAsset === instrument.baseAsset &&
                obj.quoteAsset === instrument.quoteAsset
            ) === instrument
        );
    });
  };

  fetchRates = async () => {
    const resp = await this.api.fetchRates();

    resp.AssetPairRates.forEach(({AssetPair, BidPrice, AskPrice}: any) => {
      const instrument = this.getInstrumentById(AssetPair);
      if (instrument) {
        instrument.ask = AskPrice;
        instrument.bid = BidPrice;
      }
    });
  };

  fetchCategories = async () => {
    const resp = await this.api.fetchCategories();
    runInAction(() => {
      this.categories = resp.AssetCategories;
    });
  };
}
