import * as mira from "mira-dex-ts";

type MultihopPreviewData = {
    path: [string, string, boolean][];
    input_amount: number;
    output_amount: number;
  };
  
  export const getAvailablePools = async (input: string, output: string, amount: number) => {
    const url = `https://prod.api.mira.ly/find_route`;
  
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input,
          output,
          amount,
          trade_type: "ExactOutput", // Adjust this based on your requirements
        }),
      });
  
      if (!res.ok) {
        throw new Error(`Error fetching route: ${res.statusText}`);
      }
  
      const previewData: MultihopPreviewData = await res.json();
  
      // Create pool IDs from the response
      const pools = previewData.path.map(([input, output, stable]) =>
        mira.buildPoolId(`0x${input}`, `0x${output}`, stable)
      );
  
      return pools;
    } catch (error) {
      console.error('Error fetching pools:', error);
      throw error;
    }
  };