import {inject, observer} from 'mobx-react';
import * as React from 'react';
import {RouteComponentProps} from 'react-router-dom';
import {RootStoreProps} from '../../App';
import {
  ROUTE_DEPOSIT_CREDIT_CARD_FAIL,
  ROUTE_DEPOSIT_CREDIT_CARD_SUCCESS,
  ROUTE_WALLETS
} from '../../constants/routes';
import {STORE_ROOT} from '../../constants/stores';

import './style.css';

export interface PaymentGatewayProps
  extends RootStoreProps,
    RouteComponentProps<any> {}

export class PaymentGateway extends React.Component<PaymentGatewayProps> {
  readonly depositCreditCardStore = this.props.rootStore!
    .depositCreditCardStore;

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    return (
      <div className="payment-gateway">
        <iframe
          onLoad={this.handleIframeLoaded}
          src={this.depositCreditCardStore.gatewayUrls.paymentUrl}
        />
      </div>
    );
  }

  private handleIframeLoaded = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    try {
      const currentUrl = e.currentTarget.contentWindow.location.href;
      const redirectUrls = {
        [this.depositCreditCardStore.gatewayUrls
          .okUrl]: ROUTE_DEPOSIT_CREDIT_CARD_SUCCESS,
        [this.depositCreditCardStore.gatewayUrls
          .failUrl]: ROUTE_DEPOSIT_CREDIT_CARD_FAIL,
        [this.depositCreditCardStore.gatewayUrls.cancelUrl]: ROUTE_WALLETS
      };
      const redirectUrl = redirectUrls[currentUrl];

      if (redirectUrl) {
        this.props.history.replace(redirectUrl);
      }
      if (currentUrl === this.depositCreditCardStore.gatewayUrls.cancelUrl) {
        this.props.history.replace(ROUTE_WALLETS);
      }
    } catch (err) {
      // Can't access iframe URL
    }
  };
}

export default inject(STORE_ROOT)(observer(PaymentGateway));
