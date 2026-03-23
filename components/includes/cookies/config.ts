import { sendGTMEvent } from '@next/third-parties/google';
import type { CookieConsentConfig } from 'vanilla-cookieconsent';

const updateGoogleTagManager = (categories: string[]) => {
  const consentUpdate: Record<string, 'granted' | 'denied'> = {
    ad_storage:               categories.includes('marketing') ? 'granted' : 'denied',
    analytics_storage:        categories.includes('analytics') ? 'granted' : 'denied',
    functionality_storage:    categories.includes('necessary') ? 'granted' : 'denied',
    personalization_storage:  categories.includes('marketing') ? 'granted' : 'denied',
    security_storage:         categories.includes('necessary') ? 'granted' : 'denied',
  };

  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('consent', 'update', consentUpdate);
  }

  sendGTMEvent({ event: 'consent_update', ...consentUpdate });
};

export const config: CookieConsentConfig = {
  guiOptions: {
    consentModal: {
      layout: 'box',
      position: 'bottom right',
      equalWeightButtons: true,
      flipButtons: false,
    },
    preferencesModal: {
      layout: 'box',
      position: 'left',
      equalWeightButtons: true,
      flipButtons: false,
    },
  },

  onConsent: ({ cookie }) => {
    updateGoogleTagManager(cookie.categories);
  },

  onChange: ({ cookie }) => {
    updateGoogleTagManager(cookie.categories);
  },

  categories: {
    necessary: { readOnly: true, enabled: true },
    analytics: { enabled: false },
    marketing: { enabled: false }
  },

  language: {
    default: 'pt',

    translations: {
      pt: {
        consentModal: {
          title: "Nós valorizamos sua privacidade!",
          description:
            'Nosso site utiliza cookies para entender como você interage com ele e melhorar sua experiência. O rastreamento só será ativado se você aceitar explicitamente. <a href="#privacy-policy" data-cc="show-preferencesModal" class="cc__link">Gerenciar preferências</a>',
          acceptAllBtn: 'Aceitar todos',
          acceptNecessaryBtn: 'Recusar todos',
          showPreferencesBtn: 'Gerenciar preferências',
          footer: `
            <a href="politica-de-privacidade">Política de Privacidade</a>
            <a href="termos-de-uso">Termos de Uso</a>
          `,
        },
        preferencesModal: {
          title: 'Preferências de Cookies',
          acceptAllBtn: 'Aceitar todos',
          acceptNecessaryBtn: 'Recusar todos',
          savePreferencesBtn: 'Salvar preferências',
          closeIconLabel: 'Fechar',
          sections: [
            {
              title: 'Uso de Cookies',
              description:
                'Utilizamos cookies para garantir as funcionalidades básicas do site e aprimorar sua experiência online. Você pode escolher ativar ou desativar cada categoria sempre que quiser. Para mais detalhes sobre cookies e outros dados sensíveis, por favor, leia nossa <a href="politica-de-privacidade" class="cc__link">política de privacidade</a> completa.',
            },
            {
              title: 'Cookies estritamente necessários',
              description: 'Estes cookies são essenciais para o funcionamento adequado do site. Eles não armazenam dados pessoais e não podem ser desativados.',
              linkedCategory: 'necessary',
            },
            {
              title: 'Cookies de Desempenho e Análise',
              description: 'Coletam dados anônimos sobre como você utiliza o site. Nos ajudam a melhorar a navegação e entender o tráfego. <b>Ferramentas utilizadas:</b> Google Analytics e Microsoft Clarity.',
              linkedCategory: 'analytics',
              cookieTable: {
                headers: {
                  name: 'Nome (Exemplo)',
                  domain: 'Serviço',
                  description: 'Descrição',
                  expiration: 'Validade',
                },
                body: [
                  {
                    name: '_ga, _gid',
                    domain: 'Google Analytics',
                    description: 'Usados para distinguir usuários e gerar dados estatísticos.',
                    expiration: 'Até 2 anos',
                  },
                  {
                    name: '_clck, _clsk',
                    domain: 'Microsoft Clarity',
                    description: 'Salvam o ID do usuário e dados de sessão para mapas de calor.',
                    expiration: 'Até 1 ano',
                  },
                ],
              },
            },
            {
              // NOVA SESSÃO DE MARKETING ADICIONADA AQUI
              title: 'Cookies de Marketing e Publicidade',
              description: 'São usados para rastrear visitantes em diferentes sites. A intenção é exibir anúncios relevantes e engajadores para o usuário. <b>Ferramentas utilizadas:</b> Meta Ads, Google Ads, TikTok Ads e LinkedIn Ads.',
              linkedCategory: 'marketing', // Categoria que criaremos no objeto principal
              cookieTable: {
                headers: {
                  name: 'Nome (Exemplo)',
                  domain: 'Serviço',
                  description: 'Descrição',
                  expiration: 'Validade',
                },
                body: [
                  {
                    name: '_fbp',
                    domain: 'Meta (Facebook)',
                    description: 'Usado para rastrear visitas e otimizar anúncios no Facebook/Instagram.',
                    expiration: '3 meses',
                  },
                  {
                    name: '_gcl_au',
                    domain: 'Google Ads',
                    description: 'Usado para testar a eficiência da publicidade em nossos sites.',
                    expiration: '3 meses',
                  },
                  {
                    name: '_tt_enable_cookie',
                    domain: 'TikTok Ads',
                    description: 'Mede o desempenho de campanhas publicitárias do TikTok.',
                    expiration: '1 ano',
                  },
                ],
              },
            },
            {
              title: 'Mais informações',
              description:
                'Para qualquer dúvida em relação à nossa política de cookies e suas escolhas, por favor, <a class="cc__link" href="#seusite.com">entre em contato conosco</a>.',
            },
          ],
        },
      },
    },
  },
};