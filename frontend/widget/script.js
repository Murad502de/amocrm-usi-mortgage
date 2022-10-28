define(['jquery', 'underscore', 'twigjs', 'lib/components/base/modal'], function ($, _, Twig, Modal) {
  let CustomWidget = function () {
    let self = this;

    self.isDev = false;

    this.config = {
      baseUrl: 'https://hub.integrat.pro/Murad/amocrm-usi-mortgage/backend/public',
      name: 'usiMortgage',
      widgetPrefix: 'usi-mortgage',
      mortgagePipeline: self.isDev ? 4799893 : 4691106,
      subdomain: self.isDev ? 'integrat3' : 'usikuban',
      userDirectorate: 3071437,
      userAdmin: 2825410,
      pipelineGub: 1393867, // KRD
      pipelineGubPark: 4551384, // KRD
      pipelineDost: 3302563, // KRD
      pipelineDostPark: 4703964, // KRD

      pipelineVeresaevo: 1399426, // RND
      pipelineVeresaevoPark: 4551393, // RND
      pipelineLevober: 4242663, // RND
      pipelineLevoberPark: 5133726, // RND
      pipelineAP: 5771604, // RND

      pipelineStv: 1399423, // STV
      pipelineStvKvartet: 5129982, // STV
      pipelineStvKvartetParking: 5133513, // STV
      pipelineStv1777: 4551390, // STV
      pipelineStv1777Parking: 5521488, // STV
    },

      this.dataStorage = {
        currentModal: null,
        modalWidth_modalCreateMortgage: '550px',
        messageForBroker: '',
      },

      this.selectors = {
        mortgageBtn: `js-${self.config.widgetPrefix}__button`,
        hidden: `${self.config.widgetPrefix}__hidden`,
        modalCreateBtnConfirm: `${self.config.widgetPrefix}__modal-create-mortgage_confirm`,
        modalCreateBtnCancel: `${self.config.widgetPrefix}__modal-create-mortgage_cancel`,
        modalCreateBtnConsult: `${self.config.widgetPrefix}__modal-create-mortgage_consult`,
        usiBroker: `js-${self.config.widgetPrefix}__broker`,
        messageForBroker: `js-${self.config.widgetPrefix}__broker--message`,

        js: {
          tgRadioInput: self.isDev ? 'input[id="cf_1037269_617377_"]' : 'input[id="cf_589157_1262797_"]',
          tgPaymentForm: self.isDev ? 'div[data-id="1037269"]' : 'div[data-id="589157"]',
          rocketSales: 'li[id="copyLeadTemplatesWidget"]',
        },
      },

      this.getters = {
        getLeadDataById: function (id, callback) {
          self.helpers.debug(self.config.name + " << [getter] : getLeadDataById");

          let lead;

          $.get(
            `${self.config.baseUrl}/lead/${id}`,

            function (response) {
              self.helpers.debug(`${self.config.name} << [getter] : getLeadDataById << [getData] : ${response}`);
              self.helpers.debug(response);

              callback(response);
            }
          );

          return lead;
        }
      },

      this.setters = {},

      this.baseHtml = {},

      this.renderers = {

        /**
         * Method for generating and rendering the .twig template
         * 
         * @public
         * 
         * @param {str} template - the name of the .twig template
         * @param {obj} params - template settings. The format is:
         * {
         *    widgetPrefix : self.config.widgetPrefix,
         *    ...
         * }
         * 
         * @param {obj} callback - callback settings. The format is:
         * {
         *    exec : function ( param_1.val, param_2.val, ..., param_n.val ) {},
         *    params : {
         *      param_1 : val,
         *      param_2 : val,
         *      ...
         *      param_n : val,
         *    }
         * }
         * 
         * @returns
         */
        render: function (template, params, callback = null) {
          params = (typeof params == 'object') ? params : {};
          template = template || '';

          return self.render(
            {
              href: '/templates/' + template + '.twig',
              base_path: self.params.path,
              v: self.get_version(),
              load: (template) => {
                let html = template.render({ data: params });

                callback.params ? callback.exec(html, callback.params) : callback.exec(html);
              }
            },

            params
          );
        },

        /**
         * Example of render method .twig template
         * 
         * @param {str} selector 
         * @param {obj} data 
         * @param {str} location 
         */
        renderMortgageButton: function (selector, data = null, location = 'append') {
          let mortgageButtonData = {
            widgetPrefix: self.config.widgetPrefix,
            isHidden: !$(self.selectors.js.tgRadioInput)[0].checked,
            title: data.title,
          };

          self.renderers.render(
            'mortgageButton',
            mortgageButtonData,

            {
              exec: (html) => {
                $(selector)[location](html);
              }
            }
          );
        },

        renderModalCreateMortgage: function () {
          let modalCreateMortgageData = {
            widgetPrefix: self.config.widgetPrefix,
          };

          let showParams = {
            sizeParams: {
              width: self.dataStorage.modalWidth_modalCreateMortgage,
              height: null
            }
          };

          self.renderers.render(
            'modalCreateMortgage',
            modalCreateMortgageData,
            {
              exec: self.renderers.modalWindow.show,
              params: showParams
            }
          );
        },

        modalWindow: {
          objModalWindow: null,

          show: function (html, modalParams, callback = null, callbackParams = {}) {
            self.renderers.modalWindow.objModalWindow = new Modal(
              {
                class_name: "modal-window",

                init: function ($modal_body) {
                  let $this = $(this);

                  modalParams.sizeParams.width ? $modal_body.css('min-width', modalParams.sizeParams.width) : $modal_body.css('min-width', 'auto');
                  modalParams.sizeParams.height ? $modal_body.css('height', modalParams.sizeParams.height) : $modal_body.css('height', 'auto');

                  $modal_body.css('width', 'max-content');

                  $modal_body
                    .append(html)
                    .trigger('modal:loaded')
                    .trigger('modal:centrify');
                },

                destroy: function () {
                  console.debug("close modal-destroy");

                  return true;
                }
              }
            );
          },

          setData: function (data) {
            $('div.modal-body__inner__todo-types').append(data);
          },

          destroy: function () {
            this.objModalWindow.destroy();
          }
        },
      },

      this.handlers = {
        onMortgageBtn: function () {
          self.helpers.debug(self.config.name + " << [handler] : onMortgageBtn");
          self.helpers.debug('self.dataStorage.link: ' + self.dataStorage.link);

          self.getters.getLeadDataById(
            Number(AMOCRM.data.current_card.id),

            function (lead) {
              self.helpers.debug('lead data');
              self.helpers.debug(lead);

              if (lead.data) {
                self.helpers.debug('Folge dem Link zum Lead: ');
                self.helpers.debug(lead.data);

                document.location.href = `https://${self.config.subdomain}.amocrm.ru/leads/detail/${lead.data.related_lead}`;
              }
              else {
                self.helpers.debug('Neues Lead in der Hypothek erstellen: ');
                self.helpers.debug(lead.data);

                self.renderers.renderModalCreateMortgage();
              }
            }
          );
        },

        selectPaymentForm: function () {
          if ($(self.selectors.js.tgRadioInput)[0].checked) {
            console.log('button zeigen');

            $(`.${self.selectors.mortgageBtn}`).removeClass(`${self.selectors.hidden}`);
          }
          else {
            console.log('button ausblenden');

            $(`.${self.selectors.mortgageBtn}`).addClass(`${self.selectors.hidden}`);
          }
        },

        confirmCreateMortgage: function () {
          self.helpers.debug(self.config.name + " << [handler] : confirmCreateMortgage");

          self.helpers.setDataToModalByConfirm(
            {
              exec: self.helpers.createMortgage,
              params: {
                id: Number(AMOCRM.data.current_card.id),
                from: 'confirm',
              }
            }
          );
        },

        cancelCreateMortgage: function () {
          self.helpers.debug(self.config.name + " << [handler] : cancelCreateMortgage");

          $('div.modal-body__inner').empty();
          $('div.modal-body__inner').append(
            `
          <div class="modal-body__inner">
            <span class="modal-body__close">
              <span class="icon icon-modal-close"></span>
            </span>

            <h2 style="text-align: center; font-size: 25px; font-weight: bold;">
              Сделка не была создана
            </h2>
          </div>
          `
          );
        },

        ConsultCreateMortgage: function () {
          self.helpers.debug(self.config.name + " << [handler] : ConsultCreateMortgage");

          self.helpers.setDataToModalByConfirm(
            {
              exec: self.helpers.createMortgage,
              params: {
                id: Number(AMOCRM.data.current_card.id),
                from: 'consult',
              }
            }
          );
        },

        selectBroker: function (event) {
          console.debug(self.config.name + " << [handler] : selectBroker", event.target.getAttribute('data-id'), event.target.getAttribute('data-from'));

          if (self.dataStorage.messageForBroker.length >= 20) {
            $('div.modal-body__inner').empty();
            $('div.modal-body__inner').append(
              `
              <div class="modal-body__inner">
                <span class="modal-body__close">
                  <span class="icon icon-modal-close"></span>
                </span>

                <div class="usi-mortgage__create-mortgage-loader">
                  <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="usi-mortgage-svg__icon">
                    <path d="M3.963 2.43301C5.77756 0.86067 8.09899 -0.00333986 10.5 9.70266e-06C16.023 9.70266e-06 20.5 4.47701 20.5 10C20.5 12.136 19.83 14.116 18.69 15.74L15.5 10H18.5C18.5001 8.43163 18.0392 6.89781 17.1747 5.58927C16.3101 4.28072 15.0799 3.25517 13.6372 2.64013C12.1944 2.0251 10.6027 1.84771 9.05996 2.13003C7.5172 2.41234 6.09145 3.14191 4.96 4.22801L3.963 2.43301ZM17.037 17.567C15.2224 19.1393 12.901 20.0034 10.5 20C4.977 20 0.5 15.523 0.5 10C0.5 7.86401 1.17 5.88401 2.31 4.26001L5.5 10H2.5C2.49987 11.5684 2.96075 13.1022 3.82534 14.4108C4.68992 15.7193 5.92007 16.7449 7.36282 17.3599C8.80557 17.9749 10.3973 18.1523 11.94 17.87C13.4828 17.5877 14.9085 16.8581 16.04 15.772L17.037 17.567Z" fill="#C5C7CD"></path>
                  </svg>
                </div>
              </div>
            `
            );

            self.helpers.createMortgage({
              id: Number(AMOCRM.data.current_card.id),
              idBroker: event.target.getAttribute('data-id'),
              from: event.target.getAttribute('data-from'),
            });
          } else {
            alert('Поле "Информация для брокера" является обязательным к заполнению и должно составлять не менее 20 символов');
          }
        },

        inputBrokerMessage: function (event) {
          console.debug(event.target.value); //DELETE

          self.dataStorage.messageForBroker = event.target.value;
        },
      },

      this.actions = {},

      this.helpers = {
        debug: function (text) {
          if (self.isDev) console.debug(text);
        },
        createMortgage: function (params) {
          $.post(
            'https://hub.integrat.pro/Murad/amocrm-usi-mortgage/backend/public/mortgage/create',
            { hauptLeadId: params.id, from: params.from, idBroker: params.idBroker, messageForBroker: self.dataStorage.messageForBroker, },
            function (data) {
              console.log(data);

              $('.usi-mortgage__button-inner__text').text('В сделке ипотека');
              $('div.modal-body__inner').empty();
              $('div.modal-body__inner').append(
                `
              <div class="modal-body__inner">
                <span class="modal-body__close">
                  <span class="icon icon-modal-close"></span>
                </span>

                <h2 style="text-align: center; font-size: 25px; font-weight: bold;">
                  Запрос на создание был успешно отправлен
                </h2>
              </div>
              `
              );
            }
          )
            .done(function (data) {
              console.debug(`${self.config.name}[handler]::createMortgage[success]`, data); // DELETE

              $('.usi-mortgage__button-inner__text').text('Перейти в сделку Ипотека');
            })
            .fail(function () {
              alert("Произошла ошибка. За подробной информацией обратитесь в компанию INTEGRAT");
            })
            .always(function () {
              self.helpers.closeModal();
            });
        },
        setDataToModalByConfirm: function (callback) {
          $('div.modal-body__inner').empty();
          $('div.modal-body__inner').append(
            `
            <div class="modal-body__inner">
              <span class="modal-body__close">
                <span class="icon icon-modal-close"></span>
              </span>

              <h2 class="modal-body__caption head_2">
                Выберете брокера
              </h2>

              <div class="usi-mortgage__modal-create-mortgage_actions">
                ${self.helpers.isKrdPipeline() ? `
                <div>
                  <button type="button" class="usi-mortgage__button ${self.selectors.usiBroker}" data-id="7507200" data-from="${callback.params.from}">
                    <span class="usi-mortgage__button-inner" data-id="7507200" data-from="${callback.params.from}">
                      <span class="usi-mortgage__button-inner__text" data-id="7507200" data-from="${callback.params.from}">
                        ${AMOCRM.constant('managers')['7507200']?.title}
                      </span>
                    </span>
                  </button>

                  <button type="button" class="usi-mortgage__button ${self.selectors.usiBroker}" style="margin-top: 10px;" data-id="7896546" data-from="${callback.params.from}">
                    <span class="usi-mortgage__button-inner" data-id="7896546" data-from="${callback.params.from}">
                      <span class="usi-mortgage__button-inner__text" data-id="7896546" data-from="${callback.params.from}">
                        ${AMOCRM.constant('managers')['7896546']?.title}
                      </span>
                    </span>
                  </button>
                </div>

                <div style="margin-left: 10px;">
                  <button type="button" class="usi-mortgage__button ${self.selectors.usiBroker}" data-id="8446743" data-from="${callback.params.from}">
                    <span class="usi-mortgage__button-inner" data-id="8446743" data-from="${callback.params.from}">
                      <span class="usi-mortgage__button-inner__text" data-id="8446743" data-from="${callback.params.from}">
                        ${AMOCRM.constant('managers')['8446743']?.title}
                      </span>
                    </span>
                  </button>

                  <button type="button" class="usi-mortgage__button ${self.selectors.usiBroker}" style="margin-top: 10px;" data-id="8796687" data-from="${callback.params.from}">
                    <span class="usi-mortgage__button-inner" data-id="8796687" data-from="${callback.params.from}">
                      <span class="usi-mortgage__button-inner__text" data-id="8796687" data-from="${callback.params.from}">
                        ${AMOCRM.constant('managers')['8796687']?.title}
                      </span>
                    </span>
                  </button>
                </div>
                ` : ''}

                ${self.helpers.isRndPipeline() ? `
                  <button type="button" class="usi-mortgage__button ${self.selectors.usiBroker}" data-id="8796690" data-from="${callback.params.from}">
                    <span class="usi-mortgage__button-inner" data-id="8796690" data-from="${callback.params.from}">
                      <span class="usi-mortgage__button-inner__text" data-id="8796690" data-from="${callback.params.from}">
                        ${AMOCRM.constant('managers')['8796690']?.title}
                      </span>
                    </span>
                  </button>
                ` : ''}

                ${self.helpers.isStvPipeline() ? `
                  <button type="button" class="usi-mortgage__button ${self.selectors.usiBroker}" style="margin-left: 10px;" data-id="8610618" data-from="${callback.params.from}">
                    <span class="usi-mortgage__button-inner" data-id="8610618" data-from="${callback.params.from}">
                      <span class="usi-mortgage__button-inner__text" data-id="8610618" data-from="${callback.params.from}">
                        ${AMOCRM.constant('managers')['8610618']?.title}
                      </span>
                    </span>
                  </button>

                  <button type="button" class="usi-mortgage__button ${self.selectors.usiBroker}" style="margin-left: 10px;" data-id="8796849" data-from="${callback.params.from}">
                    <span class="usi-mortgage__button-inner" data-id="8796849" data-from="${callback.params.from}">
                      <span class="usi-mortgage__button-inner__text" data-id="8796849" data-from="${callback.params.from}">
                        ${AMOCRM.constant('managers')['8796849']?.title}
                      </span>
                    </span>
                  </button>
                ` : ''}
              </div>

              <div class="usi-mortgage__modal-create-mortgage_message" style="margin-top: 20px;">
                <h6 class="modal-body__caption head_2" style="font-size: 14px;line-height: 14px;margin-bottom: 5px;font-weight: bold;">
                  Информация для брокера:
                </h6>

                <textarea class="js-usi-mortgage__broker--message" style="box-sizing: border-box;border: 1px solid rgb(211, 214, 215);height: 103px;padding: 10px;width: 320px;resize: none;height: 120px;"></textarea>
              </div>
            </div>
          `
          );
        },
        closeModal: function () {
          self.renderers.modalWindow.destroy();
        },
        buttonShouldRender: function () {
          return (
            (
              self.helpers.isKrdPipeline() ||
              self.helpers.isRndPipeline() ||
              self.helpers.isStvPipeline() ||
              self.helpers.isMortgagePipeline()
            )
            //   &&
            // (
            //   Number( AMOCRM.constant( 'user' ).id ) === Number( self.config.userAdmin )
            //     ||
            //   Number( AMOCRM.constant( 'user' ).id ) === Number( self.config.userDirectorate )
            // )
          );
        },
        isKrdPipeline: function () {
          return (
            Number(AMOCRM.data.current_card.model.attributes["lead[PIPELINE_ID]"]) === Number(self.config.pipelineGub) ||
            Number(AMOCRM.data.current_card.model.attributes["lead[PIPELINE_ID]"]) === Number(self.config.pipelineGubPark) ||
            Number(AMOCRM.data.current_card.model.attributes["lead[PIPELINE_ID]"]) === Number(self.config.pipelineDost) ||
            Number(AMOCRM.data.current_card.model.attributes["lead[PIPELINE_ID]"]) === Number(self.config.pipelineDostPark)
          );
        },
        isStvPipeline: function () {
          return (
            Number(AMOCRM.data.current_card.model.attributes["lead[PIPELINE_ID]"]) === Number(self.config.pipelineStv) ||
            Number(AMOCRM.data.current_card.model.attributes["lead[PIPELINE_ID]"]) === Number(self.config.pipelineStvKvartet) ||
            Number(AMOCRM.data.current_card.model.attributes["lead[PIPELINE_ID]"]) === Number(self.config.pipelineStvKvartetParking) ||
            Number(AMOCRM.data.current_card.model.attributes["lead[PIPELINE_ID]"]) === Number(self.config.pipelineStv1777) ||
            Number(AMOCRM.data.current_card.model.attributes["lead[PIPELINE_ID]"]) === Number(self.config.pipelineStv1777Parking)
          );
        },
        isRndPipeline: function () {
          return (
            Number(AMOCRM.data.current_card.model.attributes["lead[PIPELINE_ID]"]) === Number(self.config.pipelineVeresaevo) ||
            Number(AMOCRM.data.current_card.model.attributes["lead[PIPELINE_ID]"]) === Number(self.config.pipelineVeresaevoPark) ||
            Number(AMOCRM.data.current_card.model.attributes["lead[PIPELINE_ID]"]) === Number(self.config.pipelineLevober) ||
            Number(AMOCRM.data.current_card.model.attributes["lead[PIPELINE_ID]"]) === Number(self.config.pipelineLevoberPark) ||
            Number(AMOCRM.data.current_card.model.attributes["lead[PIPELINE_ID]"]) === Number(self.config.pipelineAP)
          );
        },
        isMortgagePipeline: function () {
          return Number(AMOCRM.data.current_card.model.attributes["lead[PIPELINE_ID]"]) === Number(self.config.mortgagePipeline);
        },
      },

      this.callbacks = {
        render: function () {
          self.helpers.debug(self.config.name + " << render"); //DELETE

          self.settings = self.get_settings();

          if (self.system().area === "lcard") {
            self.helpers.debug(self.config.name + " << wir sind in der Transaktionskarte"); //DELETE

            if (self.helpers.buttonShouldRender()) {
              if (Number(AMOCRM.data.current_card.model.attributes["lead[PIPELINE_ID]"]) === Number(self.config.mortgagePipeline)) {
                self.helpers.debug('wir sind in Hypothek'); //DELETE

                self.getters.getLeadDataById(
                  Number(AMOCRM.data.current_card.id),

                  function (lead) {
                    self.helpers.debug('lead data'); //DELETE
                    self.helpers.debug(lead); //DELETE

                    if (lead.data) {
                      self.dataStorage.link = lead.data.related_lead;

                      self.helpers.debug('Hypotheksknopfen mit der Addresse zum Hauptlead wird gezeigt: '); //DELETE
                      self.helpers.debug('lead.data: ' + lead.data); //DELETE
                      self.helpers.debug('link: ' + self.dataStorage.link); //DELETE

                      self.renderers.renderMortgageButton(
                        self.selectors.js.tgPaymentForm,
                        {
                          title: 'В основную сделку'
                        },
                        'after'
                      );
                    }
                    else {
                      self.dataStorage.link = false;

                      self.helpers.debug('Hypotheksknopfen wird nicht gezeigt: '); //DELETE
                      self.helpers.debug('lead.data: ' + lead.data); //DELETE
                      self.helpers.debug('link: ' + self.dataStorage.link); //DELETE
                    }
                  }
                );
              }
              else {
                self.helpers.debug('wir sind nicht in Hypothek'); //DELETE

                self.getters.getLeadDataById(
                  Number(AMOCRM.data.current_card.id),
                  function (lead) {
                    self.helpers.debug('lead data'); //DELETE
                    self.helpers.debug(lead); //DELETE

                    if (lead.data) {
                      self.dataStorage.link = lead.data.related_lead;

                      self.helpers.debug('Hypothekskopfen mit der Addresse zum Hypotheklead wird gezeigt: '); //DELETE
                      self.helpers.debug('lead.data: ' + lead.data); //DELETE
                      self.helpers.debug('link: ' + self.dataStorage.link); //DELETE

                      self.renderers.renderMortgageButton(
                        self.selectors.js.tgPaymentForm,
                        {
                          title: 'В сделке ипотека'
                        },
                        'after'
                      );
                    }
                    else {
                      self.dataStorage.link = false;

                      self.helpers.debug('Hypotheksknopfen wird gezeigt, um ein neues Hypotheklead hinzufügen: '); //DELETE
                      self.helpers.debug('lead.data: ' + lead.data); //DELETE
                      self.helpers.debug('link: ' + self.dataStorage.link); //DELETE

                      self.renderers.renderMortgageButton(
                        self.selectors.js.tgPaymentForm,
                        {
                          title: 'Создать сделку в воронке "Ипотека"'
                        },
                        'after'
                      );
                    }
                  }
                );
              }
            }
          }

          return true;
        },

        init: function () {
          // self.settings.widget_code

          self.helpers.debug(self.config.name + " << init");

          if (!$(`link[href="${self.settings.path}/style.css?v=${self.settings.version}"]`).length) {
            $("head").append('<link type="text/css" rel="stylesheet" href="' + self.settings.path + '/style.css?v=' + self.settings.version + '">');
          }

          return true;
        },

        bind_actions: function () {
          self.helpers.debug(self.config.name + " << bind_actions");

          if (!document[self.config.name]) {
            self.helpers.debug(`${self.config.name} does not exist`);

            document[self.config.name] = true;

            $(document).on('click', `.${self.selectors.mortgageBtn}`, self.handlers.onMortgageBtn);
            $(document).on('click', `${self.selectors.js.tgPaymentForm}`, self.handlers.selectPaymentForm);
            $(document).on('click', `.${self.selectors.modalCreateBtnConfirm}`, self.handlers.confirmCreateMortgage);
            $(document).on('click', `.${self.selectors.modalCreateBtnCancel}`, self.handlers.cancelCreateMortgage);
            $(document).on('click', `.${self.selectors.modalCreateBtnConsult}`, self.handlers.ConsultCreateMortgage);
            $(document).on('click', `.${self.selectors.usiBroker}`, self.handlers.selectBroker);
            $(document).on('input', `.${self.selectors.messageForBroker}`, self.handlers.inputBrokerMessage);
          }
          else {
            self.helpers.debug(`${self.config.name} exists`);
          }

          return true;
        },

        settings: function () {
          self.helpers.debug(self.config.name + " << settings");

          return true;
        },

        onSave: function () {
          self.helpers.debug(self.config.name + " << onSave");

          return true;
        },

        destroy: function () {
          self.helpers.debug(self.config.name + " << destroy");
        },

        contacts: {
          //select contacts in list and clicked on widget name
          selected: function () {
            self.helpers.debug(self.config.name + " << contacts selected");
          }
        },

        leads: {
          //select leads in list and clicked on widget name
          selected: function () {
            self.helpers.debug(self.config.name + " << leads selected");
          }
        },

        tasks: {
          //select taks in list and clicked on widget name
          selected: function () {
            self.helpers.debug(self.config.name + " << tasks selected");
          }
        },

        advancedSettings: function () {
          self.helpers.debug(self.config.name + " << advancedSettings");

          return true;
        },

        /**
         * Метод срабатывает, когда пользователь в конструкторе Salesbot размещает один из хендлеров виджета.
         * Мы должны вернуть JSON код salesbot'а
         *
         * @param handler_code - Код хендлера, который мы предоставляем. Описан в manifest.json, в примере равен handler_code
         * @param params - Передаются настройки виджета. Формат такой:
         * {
         *   button_title: "TEST",
         *   button_caption: "TEST",
         *   text: "{{lead.cf.10929}}",
         *   number: "{{lead.price}}",
         *   url: "{{contact.cf.10368}}"
         * }
         *
         * @return {{}}
         */
        onSalesbotDesignerSave: function (handler_code, params) {
          var salesbot_source = {
            question: [],
            require: []
          },
            button_caption = params.button_caption || "",
            button_title = params.button_title || "",
            text = params.text || "",
            number = params.number || 0,
            handler_template = {
              handler: "show",
              params: {
                type: "buttons",
                value: text + ' ' + number,
                buttons: [
                  button_title + ' ' + button_caption,
                ]
              }
            };

          console.log(params);

          salesbot_source.question.push(handler_template);

          return JSON.stringify([salesbot_source]);
        },
      };

    return this;
  };

  return CustomWidget;
});