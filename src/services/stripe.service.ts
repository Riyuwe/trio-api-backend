import {BindingScope, injectable} from '@loopback/core';
import {config} from './../config';
const stripe = require('stripe');

@injectable({scope: BindingScope.TRANSIENT})
export class StripeService {
  constructor(/* Add @inject to inject parameters */) {}

  /*
   * Add service methods here
   */

  private static async setupTransporter() {
    let API_KEY = config.stripe.prodKey;
    if (process.env.NODE_ENV === 'development') {
      API_KEY = config.stripe.testKey;
    }

    return stripe(API_KEY);
  }

  async createCharges(payload: StripeCharge): Promise<any> {
    try {
      const transporter = await StripeService.setupTransporter();
      return transporter.charges.create(payload);
    } catch (error) {
      throw new Error(error);
    }
  }
}

export interface StripeCharge {
  amount: number;
  currency: string;
  description: string;
  source: string;
  metadata: Object;
}
