import { useState } from "react";
import "./App.css";
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";
import "@demox-labs/aleo-wallet-adapter-reactui/dist/styles.css";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";

function App() {
  const [receivingAddress, setReceivingAddress] = useState("");
  const [vaultDuration, setvaultDuration] = useState("");
  const [creditsAmount, setcreditsAmount] = useState("");
  const [executing, setExecuting] = useState(false);
  const [vaultRecord, setVaultRecord] = useState(""); // new state variable

  const { publicKey, requestTransaction, requestRecordPlaintexts } = useWallet();

  async function execute() {
    setExecuting(true);

    const url = 'https://api.explorer.provable.com/v1/testnet/latest/height';
    const options = { method: 'GET', headers: { Accept: 'application/json' } };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      // assuming the response contains a field named 'height'

      if (!requestTransaction) {
        alert("No wallet connected");
        setExecuting(false);
        return;
      }

      const result = await requestTransaction({
        address: publicKey || "",
        chainId: "testnetbeta",
        transitions: [{
          program: "piggybanker10.aleo",
          functionName: "rcreatevault",
          inputs: [
            `${vaultRecord}`,
            `${data}u32`, // e.g. "12345u32"
            `${vaultDuration}u32`,
            `${creditsAmount}u64`
          ]
        }],
        fee: 80000, // fees in microcredits
        feePrivate: false,
      });

      console.log(result);
    } catch (error) {
      console.error(error);
    }

    setExecuting(false);
  }
  async function createpriv() {
    if (!requestTransaction) {
      alert("No wallet connected");
      return;
    }
    if (!vaultRecord) {
      alert("No Vault record found. Please request a record first.");
      return;
    }
    const result = await requestTransaction({
      address: publicKey || "",
      chainId: "testnetbeta",
      transitions: [{
        program: "piggybanker10.aleo",
        functionName: "rcreatevault",
        inputs: [
          `${data}u32`, // e.g. "12345u32"
          `${vaultDuration}u32`, // using the vaultRecord value from state
          `${creditsAmount}u64`
        ]
      }],
      fee: 100000, // fees in microcredits
      feePrivate: false,
    });
    console.log(result);
  }

  async function withdraw() {
    if (!requestTransaction) {
      alert("No wallet connected");
      return;
    }
    if (!vaultRecord) {
      alert("No Vault record found. Please request a record first.");
      return;
    }
    const result = await requestTransaction({
      address: publicKey || "",
      chainId: "testnetbeta",
      transitions: [{
        program: "piggybanker10.aleo",
        functionName: "withdraw",
        inputs: [
          `${vaultRecord}`, // using the vaultRecord value from state
          `${receivingAddress}`,
          `${creditsAmount}u64`
        ]
      }],
      fee: 100000, // fees in microcredits
      feePrivate: false,
    });
    console.log(result);
  }

  async function requestRecord() {
    if (!requestRecordPlaintexts) {
      alert("No wallet connected");
      return;
    }
    const records = await requestRecordPlaintexts('credits.aleo');
    const unspentRecords = records.filter(record => !record.spent);

    if (unspentRecords.length > 0) {
      console.log("Unspent Records:");
      unspentRecords.forEach((record, index) => {
        console.log(`Record ${index + 1}:`, record.plaintext);
      });
      // Set the first available vault record as the input
      setVaultRecord(unspentRecords[0].plaintext);
    } else {
      console.log("No unspent records found");
      setVaultRecord("");
    }
  }

  return (
    <>
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <WalletMultiButton />
      </div>
      <div></div>
      <h1></h1>
      <div className="card">
        <p>
          <button disabled={executing} onClick={execute}>
            {executing
              ? `Executing...check console for details...`
              : `createvault`}
          </button>
        </p>
        <input 
          type="text" 
          placeholder="Enter receiving address"
          value={receivingAddress}
          onChange={(e) => setReceivingAddress(e.target.value)}
          className="card"
          style={{
            padding: '0.6em 1.2em',
            borderRadius: '8px',
            border: '1px solid transparent',
            fontSize: '1em',
            fontWeight: '500',
            fontFamily: 'inherit',
            backgroundColor: '#1a1a1a',
            cursor: 'text',
            transition: 'border-color 0.25s'
          }}
        />
        <input 
          type="text" 
          placeholder="Enter record"
          value={vaultRecord}
          onChange={(e) => setVaultRecord(e.target.value)}
          className="card"
          style={{
            padding: '0.6em 1.2em',
            borderRadius: '8px',
            border: '1px solid transparent',
            fontSize: '1em',
            fontWeight: '500',
            fontFamily: 'inherit',
            backgroundColor: '#1a1a1a',
            cursor: 'text',
            transition: 'border-color 0.25s'
          }}
        />
         <input 
          type="text" 
          placeholder="Enter Duration in hours"
          value={vaultDuration}
          onChange={(e) => setvaultDuration(e.target.value)}
          className="card"
          style={{
            padding: '0.6em 1.2em',
            borderRadius: '8px',
            border: '1px solid transparent',
            fontSize: '1em',
            fontWeight: '500',
            fontFamily: 'inherit',
            backgroundColor: '#1a1a1a',
            cursor: 'text',
            transition: 'border-color 0.25s'
          }}
        />
         <input 
          type="text" 
          placeholder="Enter amount of credits"
          value={creditsAmount}
          onChange={(e) =>  setcreditsAmount(e.target.value)}
          className="card"
          style={{
            padding: '0.6em 1.2em',
            borderRadius: '8px',
            border: '1px solid transparent',
            fontSize: '1em',
            fontWeight: '500',
            fontFamily: 'inherit',
            backgroundColor: '#1a1a1a',
            cursor: 'text',
            transition: 'border-color 0.25s'
          }}
        />
        <p>
          <button onClick={createpriv}>
            {`Create vault with privacy`}
          </button>
        </p>
        <p>
          <button onClick={withdraw}>
            {`Click to withdraw`}
          </button>
        </p>
        <p>
          <button onClick={requestRecord}>
            {`Request record`}
          </button>
        </p>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </>
  );
}

export default App;