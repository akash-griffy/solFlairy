import { Predicate, Provider } from 'fuels';
import { bin as bytecode2, abi as abi2 } from '../predicates/predicate2.js';
import { createB256Address } from './solanaB256Converter.js';
import { getProvider } from './getProvider.js';

export const getSolanaAddressPredicateAddress = async (solanaAccountAddress:string) => {
  const provider = await getProvider()

  const predicate2 = new Predicate({
    bytecode: bytecode2,
    abi: abi2,
    provider,
    configurableConstants: {
      SIGNER: createB256Address(solanaAccountAddress),
    },
  });

  return predicate2.address.toString()
};
