'use client';

import { UI } from '@/components/ui';
import { PropsWithChildren, useEffect, useState } from 'react';
import {
    useAccount,
    useChainId,
    usePublicClient,
    useWalletClient,
} from 'wagmi';
import configContracts from '@/config/mumbai.json';
import quoromaABI from '@/abis/QuoromaID.json';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Hash } from 'lucide-react';

interface Props extends PropsWithChildren {
    className?: string;
}

export const JoinCommunityButton = ({ className, children }: Props) => {
    const chainId = useChainId();
    const publicClient = usePublicClient({ chainId });
    const { data: walletClient } = useWalletClient({ chainId });
    const { address } = useAccount({ chainId });
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMinted, setHasMinted] = useState<boolean>(false);
    const { communityName } = useParams();

    // this code had been added after the hackathon and the jury selection to allow ervery user to test our Dapp
    function generateRandomHandle() {
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let handle = '';
        for (let i = 0; i < 6; i++) {
            handle += characters.charAt(
                Math.floor(Math.random() * characters.length)
            );
        }
        return handle;
    }

    useEffect(() => {
        if (!publicClient) {
            console.log('No public client');
        }

        if (!address) {
            console.log('No address');
            return;
        }

        (async () => {
            try {
                const balance: any = await publicClient.readContract({
                    address: configContracts.QuoromaID,
                    abi: quoromaABI,
                    functionName: 'balanceOf',
                    args: [address],
                });
                console.log('balance: ', balance);
                setHasMinted(balance > 0);
            } catch (e) {
                console.log('Error', e);
            }
        })();
    }, [publicClient, address]);

    const handleJoinCommunity = async () => {
        const randomHandle = generateRandomHandle();
        console.log('Random handle: ', randomHandle);

        console.log('Join community');
        setLoading(true);

        if (!walletClient) {
            console.log('No wallet client');
            setLoading(false);
            return;
        }

        try {
            const tx = await walletClient.writeContract({
                address: configContracts.QuoromaID,
                abi: quoromaABI,
                functionName: 'mint',
                args: [1, randomHandle],
                value: BigInt(0),
            });

            setHasMinted(tx);
            setLoading(false);
        } catch (e) {
            console.log('Error', e);
            setLoading(false);
            return;
        }
    };

    if (hasMinted) {
        return (
            <p className="mx-auto mt-2 max-w-xl text-center text-lg leading-8 text-gray-600 flex items-center gap-2">
                Start to chat on
                <UI.Button
                    asChild
                    className="gap-1"
                >
                    <Link href={`/${communityName}`}>
                        <Hash className="w-4 h-4 inline" />
                        {communityName}
                    </Link>
                </UI.Button>
            </p>
        );
    }

    return (
        <UI.Button
            disabled={loading}
            className={className}
            onClick={handleJoinCommunity}
        >
            {children}
        </UI.Button>
    );
};
