"use client"

import { UserIdentification } from "../components/form/user-identification";
import { useStepZustand } from "@/lib/zustand/step";
import { LoanReleased } from "../components/form/loan-release";
import { UserAddress } from "../components/form/user-address";
import { UserBank } from "../components/form/user-bank";
import { ChangeLoan } from "../components/form/change-loan";
import { AuthorizationLoanLink } from "../components/form/authorization-loan-link";
import { Step } from "@/enum/step";
import { Thanks } from "@/components/form/thanks";

import { Progress } from "@/components/ui/progress"

import "vanilla-cookieconsent/dist/cookieconsent.css";

export default function Home() {
  const { step, length } = useStepZustand()
  const _STEP = Object.keys(Step).length

  return (
    <main className="flex flex-col justify-center items-center w-screen min-h-dvh p-4 md:p-0 gap-4">
      <Progress value={Math.round((length / _STEP) * 100)} className="w-full max-w-sm" />

      <UserIdentification />
      <LoanReleased />
      <ChangeLoan />
      <UserAddress />
      <UserBank />
      <AuthorizationLoanLink />
      <Thanks />
    </main>
  );
}

/*

{ step === Step.USER_IDENTIFICATION && <UserIdentification /> }
{ step === Step.LOAN_RELEASED && <LoanReleased /> }
{ step === Step.CHANGE_LOAN && <ChangeLoan /> }
{ step === Step.USER_ADDRESS && <UserAddress /> }
{ step === Step.USER_BANK && <UserBank /> }
{ step === Step.AUTHORIZATION_LOAN_LINK && <AuthorizationLoanLink /> }
{ step === Step.THANKS && <Thanks /> }

*/
