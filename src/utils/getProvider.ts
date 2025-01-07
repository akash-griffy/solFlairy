import { Provider } from 'fuels';

let providerInstance: Provider;
export const getProvider = async () => {
  if (!providerInstance) {
    providerInstance = await Provider.create(
      process.env.PROVIDER_RPC_URL as string
    );
  }
  return providerInstance;
};
