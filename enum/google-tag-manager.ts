export enum GoogleTagManager {
  // Etapa 1 - CPF
  CLIENT_DOCUMENT_SUBMITTED = "document_submitted",

  // Etapa 2 - Autorização API
  CLIENT_AUTH_DENIED = "auth_denied",
  CLIENT_AUTH_GRANTED = "auth_granted",

  // Etapa 3 - Oferta
  LOAN_OFFER_VIEWED = "loan_offer_viewed",
  LOAN_OFFER_ACCEPTED = "loan_offer_accepted",
  LOAN_OFFER_CHANGE = "loan_offer_change",

  // Etapa 3b - Alteração de valor
  LOAN_OFFER_CHANGED = "loan_offer_changed",

  // Etapa 4 - Endereço
  CLIENT_ADDRESS_SUBMITTED = "address_submitted",

  // Etapa 5 - Banco
  CLIENT_BANK_SUBMITTED = "bank_submitted",

  // Etapa 6 - WhatsApp
  CLIENT_WHATSAPP_SUBMITTED = "whatsapp_submitted",

  // Agradecimento
  WHATSAPP_CLICKED = "whatsapp_clicked",
}