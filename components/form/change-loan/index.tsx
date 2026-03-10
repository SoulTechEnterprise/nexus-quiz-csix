import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Step } from "@/enum/step";
import { useStepZustand } from "@/lib/zustand/step";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { IMaskMixin } from "react-imask";
import z from "zod";

const zodSchema = z.object({
    instalment: z.enum(["12x", "24x", "36x", "48x"]),
    amount: z.string()
})

type ZodSchema = z.infer<typeof zodSchema>

const _FORM = "form-change-loan"

export function ChangeLoan() {
    const { update } = useStepZustand()

    const { control, handleSubmit } = useForm<ZodSchema>({
        resolver: zodResolver(zodSchema)
    })

    const handleForm = ({ instalment, amount }: ZodSchema) => {
        update(Step.LOAN_RELEASED)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BadgeCheck className="size-4 text-blue-500" /> {process.env.NEXT_PUBLIC_TITLE_CARD}</CardTitle>
                <CardDescription>Configure os detalhes da sua oferta e avance para a próxima etapa da simulação.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(handleForm)} id={_FORM}>
                    <FieldGroup>
                        <Controller
                            name="instalment"
                            control={control}
                            render={({field, fieldState}) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Quantidade de parcelas</FieldLabel>
                                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="12x">12x</SelectItem>
                                            <SelectItem value="24x">24x</SelectItem>
                                            <SelectItem value="26x">26x</SelectItem>
                                            <SelectItem value="48x">48x</SelectItem>
                                        </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}
                        />

                        <Controller
                            name="amount"
                            control={control}
                            render={({field, fieldState}) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Valor</FieldLabel>
                                    <InputMask
                                        mask={Number}
                                        radix=","
                                        thousandsSeparator="."
                                        padFractionalZeros={true}
                                        normalizeZeros={true}
                                        scale={2}
                                        min={0}
                                        max={1000000}
                                        value={field.value?.toString() || ""}
                                        unmask={false}
                                        onAccept={(value: string) => field.onChange(value)}
                                        placeholder="R$ 0,00"
                                    />
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter>
                <Button type="submit" form={_FORM}>Próximo</Button>
            </CardFooter>
        </Card>
    )
}

const InputMask = IMaskMixin(({ inputRef, ...props }: any) => (
  <Input {...props} ref={inputRef} />
))