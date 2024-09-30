// lib/program.ts
import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Idl } from '@project-serum/anchor';
import idl from '@/app/sol_staking.json';

export const PROGRAM_ID = new PublicKey('GKYMS6nUMankxjbqEyJecJ9ubwWLkWK7cf5f5RNMM9aJ');

export function getProgram(provider: AnchorProvider) {
  return new Program(idl as Idl, PROGRAM_ID, provider);
}