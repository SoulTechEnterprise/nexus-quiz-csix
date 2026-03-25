import Link from "next/link"

export function Footer() {
	return (
		<footer className="p-4 flex flex-col items-center justify-center gap-4 text-xs text-white/50">
			<div className="flex gap-4">
				<Link href="politica-de-privacidade">Política de privacidade</Link>
				<Link href="termos-de-uso">Termos de uso</Link>
			</div>
			<p>@2026 todos os diretos estão reservados - Nexus</p>
		</footer>
	)
}
