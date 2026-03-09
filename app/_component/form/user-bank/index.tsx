import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Bank } from "@/enum/bank";
import { useUserBankZustand } from "@/lib/zustand/user-bank";
import { toast } from "sonner";
import { BadgeCheck } from "lucide-react";

const zodSchema = z.object({
    type: z.enum(Bank),
    code: z.string().nonempty(),
    agency: z.string().nonempty(),
    account: z.string().nonempty()
})

type ZodSchema = z.infer<typeof zodSchema>

const _FORM = "form-user-bank"

export function UserBank() {
    const { data: { type, code, agency, account }, update } = useUserBankZustand()

    const { control, handleSubmit, formState: { isSubmitting } } = useForm({
        resolver: zodResolver(zodSchema),
        values: {
            type: (type || "") as any,
            code: code || "",
            agency: agency || "",
            account: account || ""
        }
    })

    const banks = [
        "001 - Banco do Brasil S.A.",
        "033 - Banco Santander (Brasil) S.A.",
        "077 - Banco Inter S.A.",
        "104 - Caixa Econômica Federal",
        "197 - Stone Pagamentos S.A.",
        "208 - Banco BTG Pactual S.A.",
        "212 - Banco Original S.A.",
        "237 - Banco Bradesco S.A.",
        "260 - Nubank (Nu Pagamentos S.A.)",
        "290 - PagSeguro Internet S.A.",
        "336 - Banco C6 S.A.",
        "341 - Itaú Unibanco S.A.",
        "464 - Banco Sumitomo Mitsui Brasileiro S.A.",
        "633 - Banco Rendimento S.A.",
        "652 - Itaú Unibanco Holding S.A.",
        "745 - Citibank N.A.",
        "748 - Banco Cooperativo Sicredi S.A.",
        "756 - Banco Cooperativo do Brasil S.A. (Sicoob)"
    ];
    
    const handleFormUserBank = ({ type, code, agency, account }: ZodSchema) => {
        toast.success("Banco adicionado com sucesso!")

        update({ type, code, agency, account })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BadgeCheck className="size-4 text-blue-500" /> {process.env.NEXT_PUBLIC_TITLE_CARD}</CardTitle>
                <CardDescription>Informe a conta bancária para o depósito do empréstimo.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(handleFormUserBank)} id={_FORM}>
                    <FieldGroup>
                        <Controller
                            name="type"
                            control={control}
                            render={({field, fieldState}) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Tipo de Conta</FieldLabel>
                                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="Corrente Individual">Corrente Individual</SelectItem>
                                            <SelectItem value="Corrente Conjunta">Corrente Conjunta</SelectItem>
                                            <SelectItem value="Poupança Individual">Poupança Individual</SelectItem>
                                            <SelectItem value="Poupança Conjunta">Poupança Conjunta</SelectItem>
                                            <SelectItem value="Salário">Salário</SelectItem>
                                            <SelectItem value="Investimento">Investimento</SelectItem>
                                        </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}
                        />

                        <Controller
                            name="code"
                            control={control}
                            render={({field, fieldState}) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Banco</FieldLabel>
                                   
                                   <Combobox {...field} items={banks} value={field.value ?? ""} onValueChange={field.onChange}>
                                        <ComboboxInput placeholder="..." />
                                        <ComboboxContent>
                                            <ComboboxEmpty>No items found.</ComboboxEmpty>
                                            <ComboboxList>
                                            {(item) => (
                                                <ComboboxItem key={item} value={item}>
                                                {item}
                                                </ComboboxItem>
                                            )}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                </Field>
                            )}
                        />

                        <Controller
                            name="agency"
                            control={control}
                            render={({field, fieldState}) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Agência</FieldLabel>
                                    <Input 
                                        {...field}
                                        placeholder="..."
                                        value={field.value ?? ""}
                                    />
                                </Field>
                            )}
                        />

                        <Controller
                            name="account"
                            control={control}
                            render={({field, fieldState}) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Conta</FieldLabel>
                                    <Input 
                                        {...field}
                                        placeholder="..."
                                        value={field.value ?? ""}
                                    />
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter>
                <Button form={_FORM} type="submit">Próximo</Button>
            </CardFooter>
        </Card>
    )
}