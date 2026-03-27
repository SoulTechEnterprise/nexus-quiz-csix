"use client"

import { Thanks } from "@/components/form/thanks"
import { Progress } from "@/components/ui/progress"
import { Step } from "@/enum/step"
import { useStepZustand } from "@/lib/zustand/step"
import { AuthorizationLoanLink } from "../components/form/authorization-loan-link"
import { ChangeLoan } from "../components/form/change-loan"
import { LoanReleased } from "../components/form/loan-release"
import { UserAddress } from "../components/form/user-address"
import { UserBank } from "../components/form/user-bank"
import { UserIdentification } from "../components/form/user-identification"

import "vanilla-cookieconsent/dist/cookieconsent.css"
import { useEffect, useRef } from "react"
import { GoogleTagManager } from "@/enum/google-tag-manager"
import { useTrack } from "./hooks/use-track"

export default function Home() {
	const { step, length } = useStepZustand()
	const { track } = useTrack()
	const _STEP = Object.keys(Step).length

	const hasTracked = useRef(false)

	useEffect(() => {
		if (!hasTracked.current) {
			track({ event: GoogleTagManager.PAGE_VIEW })
			hasTracked.current = true
		}

		localStorage.clear()
	}, [track])

	const ProgressMap: Partial<Record<Step, number>> = {
		[Step.USER_IDENTIFICATION]: 0,
		[Step.LOAN_RELEASED]: 16,
		[Step.CHANGE_LOAN]: 32,
		[Step.USER_ADDRESS]: 48,
		[Step.USER_BANK]: 64,
		[Step.AUTHORIZATION_LOAN_LINK]: 80,
		[Step.THANKS]: 100,
	}

	const currentProgress = ProgressMap[step] || 0

	return (
		<main className="flex flex-col justify-center items-center w-screen min-h-dvh p-4 md:p-0 gap-4">
			<Progress value={currentProgress} className="w-full max-w-sm" />

			{step === Step.USER_IDENTIFICATION && <UserIdentification />}
			{step === Step.LOAN_RELEASED && <LoanReleased />}
			{step === Step.CHANGE_LOAN && <ChangeLoan />}
			{step === Step.USER_ADDRESS && <UserAddress />}
			{step === Step.USER_BANK && <UserBank />}
			{step === Step.AUTHORIZATION_LOAN_LINK && <AuthorizationLoanLink />}
			{step === Step.THANKS && <Thanks />}
		</main>
	)
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
