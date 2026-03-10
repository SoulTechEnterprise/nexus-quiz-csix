"use client"

import { UserIdentification } from "../components/form/user-identification";
import { useStepZustand } from "@/lib/zustand/step";
import { AuthorizationLink } from "../components/form/authorization-link";
import { LoanReleased } from "../components/form/loan-release";
import { UserAddress } from "../components/form/user-address";
import { UserBank } from "../components/form/user-bank";
import { ChangeLoan } from "../components/form/change-loan";
import { AuthorizationLoanLink } from "../components/form/authorization-loan-link";

export default function Home() {
  const { step } = useStepZustand()

  return (
    <main className="flex flex-col gap-8 justify-center items-center w-screen p-4 md:p-">
      <UserIdentification />
      <AuthorizationLink />
      <LoanReleased />
      <ChangeLoan />
      <UserAddress />
      <UserBank />
      <AuthorizationLoanLink />
    </main>
  );
}

/*

{ step === Step.USER_IDENTIFICATION && <UserIdentification /> }
{ step === Step.AUTHORIZATION_LINK && <AuthorizationLink /> }
{ step === Step.LOAN_RELEASED && <LoanReleased /> }
{ step === Step.USER_ADDRESS && <UserAddress /> }
{ step === Step.USER_BANK && <UserBank /> }
{ step === Step.CHANGE_LOAN && <ChangeLoan /> }
{ step === Step.AUTHORIZATION_LOAN_LINK && <AuthorizationLoanLink /> }

*/