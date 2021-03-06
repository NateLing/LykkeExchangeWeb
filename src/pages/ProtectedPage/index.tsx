import * as classNames from 'classnames';
import {computed} from 'mobx';
import {inject, observer} from 'mobx-react';
import * as React from 'react';
import {Redirect, Route, RouteComponentProps, Switch} from 'react-router-dom';
import {RootStoreProps} from '../../App';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import {loadable} from '../../components/hoc/loadable';
import {NoMatch} from '../../components/NoMatch/index';
import PaymentGateway from '../../components/PaymentGateway';

import {DepositFail, DepositSuccess} from '../../components/DepositResult';
import {TransferFail} from '../../components/TransferResult/index';
import TransferResult from '../../components/TransferResult/index';
import {
  ROUTE_AFFILIATE,
  ROUTE_AFFILIATE_DETAILS,
  ROUTE_AFFILIATE_STATISTICS,
  ROUTE_ASSET_PAGE,
  ROUTE_DEPOSIT_CREDIT_CARD,
  ROUTE_DEPOSIT_CREDIT_CARD_FAIL,
  ROUTE_DEPOSIT_CREDIT_CARD_GATEWAY,
  ROUTE_DEPOSIT_CREDIT_CARD_SUCCESS,
  ROUTE_DEPOSIT_CRYPTO,
  ROUTE_GATEWAY_FAIL,
  ROUTE_GATEWAY_SUCCESS,
  ROUTE_HISTORY,
  ROUTE_ROOT,
  ROUTE_TRANSFER,
  ROUTE_TRANSFER_BASE,
  ROUTE_TRANSFER_FAIL,
  ROUTE_TRANSFER_SUCCESS,
  ROUTE_WALLETS,
  ROUTE_WALLETS_TRADING
} from '../../constants/routes';
import {STORE_ROOT} from '../../constants/stores';
import {
  DepositCreditCardPage,
  DepositCryptoPage,
  WalletPage
} from '../../pages/index';
import AffiliatePage from '../AffiliatePage/index';
import AssetPage from '../AssetPage/index';
import HistoryPage from '../HistoryPage/index';
import TransferPage from '../TransferPage/index';

export class ProtectedPage extends React.Component<
  RootStoreProps & RouteComponentProps<any>
> {
  private readonly walletStore = this.props.rootStore!.walletStore;
  private readonly profileStore = this.props.rootStore!.profileStore;
  private readonly uiStore = this.props.rootStore!.uiStore;
  private readonly assetStore = this.props.rootStore!.assetStore;
  private readonly affiliateStore = this.props.rootStore!.affiliateStore;
  private readonly featureStore = this.props.rootStore!.featureStore;
  private unlistenRouteChange: () => void;
  private readonly catalogsStore = this.props.rootStore!.catalogsStore;
  private readonly depositCreditCardStore = this.props.rootStore!
    .depositCreditCardStore;
  private readonly dialogStore = this.props.rootStore!.dialogStore;

  @computed
  private get classes() {
    return {
      app: true,
      'app--overlayed': this.props.rootStore!.uiStore.overlayed
    };
  }

  componentDidMount() {
    this.uiStore.startRequest();
    this.featureStore.getFeatures();
    this.assetStore
      .fetchCategories()
      .then(() => this.catalogsStore.fetchCountries())
      .then(() => this.assetStore.fetchAssets())
      .then(() => this.assetStore.fetchAssetsAvailableForDeposit())
      .then(() => this.assetStore.fetchInstruments())
      .then(() => this.assetStore.fetchRates())
      .then(() =>
        this.props.rootStore!.marketService.init(
          this.assetStore.instruments,
          this.assetStore.assets
        )
      )
      .then(() => this.profileStore.fetchUserInfo())
      .then(() => this.walletStore.fetchWallets())
      .then(() => this.profileStore.fetchBaseAsset())
      .then(() => this.depositCreditCardStore.fetchDepositDefaultValues())
      .then(() => this.depositCreditCardStore.fetchFee())
      .then(() => this.uiStore.finishRequest());

    this.uiStore.startRequest();
    this.dialogStore
      .fetchPendingDialogs()
      .then(() => this.uiStore.finishRequest())
      .catch(() => this.uiStore.finishRequest());

    this.unlistenRouteChange = this.props.history.listen(() => {
      this.uiStore.startRequest();
      this.walletStore
        .fetchWallets()
        .then(() => this.dialogStore.fetchPendingDialogs())
        .then(() => this.uiStore.finishRequest())
        .catch(() => this.uiStore.finishRequest());
    });
  }

  componentWillUnmount() {
    this.unlistenRouteChange();
  }

  render() {
    const asLoading = loadable(this.uiStore.hasPendingRequests);
    return (
      <div
        className={classNames(this.classes)}
        onClick={this.handleOutsideClick}
      >
        <Header />
        <div className="app__shell">
          <Switch>
            <Redirect
              exact={true}
              path={ROUTE_ROOT}
              to={ROUTE_WALLETS_TRADING}
            />
            <Redirect
              exact={true}
              path={ROUTE_WALLETS}
              to={ROUTE_WALLETS_TRADING}
            />
            <Route path={ROUTE_WALLETS} component={asLoading(WalletPage)} />
            <Route path={ROUTE_ASSET_PAGE} component={asLoading(AssetPage)} />
            <Route
              exact={true}
              path={ROUTE_TRANSFER_BASE}
              component={asLoading(TransferPage)}
            />
            <Route path={ROUTE_TRANSFER} component={asLoading(TransferPage)} />
            <Route path={ROUTE_TRANSFER_SUCCESS} component={TransferResult} />
            <Route path={ROUTE_TRANSFER_FAIL} component={TransferFail} />
            <Redirect
              exact={true}
              path={ROUTE_AFFILIATE}
              to={
                this.affiliateStore.isAgreed
                  ? ROUTE_AFFILIATE_STATISTICS
                  : ROUTE_AFFILIATE_DETAILS
              }
            />
            <Route
              path={ROUTE_AFFILIATE}
              component={asLoading(AffiliatePage)}
            />
            <Route
              path={ROUTE_DEPOSIT_CREDIT_CARD_GATEWAY}
              component={PaymentGateway}
            />
            <Route
              path={ROUTE_DEPOSIT_CREDIT_CARD_SUCCESS}
              component={DepositSuccess}
            />
            <Route
              path={ROUTE_DEPOSIT_CREDIT_CARD_FAIL}
              component={DepositFail}
            />
            <Route
              path={ROUTE_DEPOSIT_CREDIT_CARD}
              component={asLoading(DepositCreditCardPage)}
            />
            <Route path={ROUTE_HISTORY} component={asLoading(HistoryPage)} />
            <Route
              path={ROUTE_DEPOSIT_CRYPTO}
              component={asLoading(DepositCryptoPage)}
            />
            <Route
              path={ROUTE_GATEWAY_FAIL}
              // tslint:disable-next-line:jsx-no-lambda
              render={() => <div />}
            />
            <Route
              path={ROUTE_GATEWAY_SUCCESS}
              // tslint:disable-next-line:jsx-no-lambda
              render={() => <div />}
            />
            <Route component={NoMatch} />
          </Switch>
        </div>
        <Footer />
      </div>
    );
  }

  private handleOutsideClick = (e: React.MouseEvent<any>) => {
    const {toggleBaseAssetPicker, showBaseCurrencyPicker} = this.props
      .rootStore!.uiStore;
    const isBaseAssetTarget = e.target !== document.getElementById('baseAsset');
    if (isBaseAssetTarget && showBaseCurrencyPicker) {
      toggleBaseAssetPicker();
    }
  };
}

export default inject(STORE_ROOT)(observer(ProtectedPage));
