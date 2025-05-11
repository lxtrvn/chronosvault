// src/components/CreateVault.tsx
import React, { useState } from 'react';
import { useProgramManager } from '@aleohq/sdk';

const CreateVault: React.FC = () => {
    const [blockHeight, setBlockHeight] = useState<number | null>(null);
    const [duration, setDuration] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { executeFunction } = useProgramManager();

    // Function to fetch block height
    const fetchBlockHeight = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_ALEO_API_URL}/block/latest`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setBlockHeight(data.block_height); // Adjust based on actual API response structure
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (blockHeight === null) {
            setError('Block height not fetched yet. Please fetch block height first.');
            return;
        }

        try {
            setLoading(true);
            const result = await executeFunction('piggybanker5.aleo', 'createvault', [blockHeight, parseInt(duration, 10)]);
            console.log(result);
            setError(null);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Create Vault</h2>
            <button onClick={fetchBlockHeight} disabled={loading}>
                Fetch Block Height
            </button>
            {blockHeight !== null && <p>Current Block Height: {blockHeight}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Duration"
                    required
                />
                <button type="submit" disabled={loading || blockHeight === null}>
                    Create Vault
                </button>
            </form>
        </div>
    );
};

export default CreateVault;