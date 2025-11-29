export interface KIWeights {
  intercept: number;
  wForm: number;
  wHome: number;
  wInjury: number;
  wMarket: number;
}

export const defaultWeights: KIWeights = {
  intercept: 0.4,
  wForm: 0.25,
  wHome: 0.15,
  wInjury: 0.10,
  wMarket: 0.10
};
