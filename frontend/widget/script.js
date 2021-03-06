define( [ 'jquery', 'underscore', 'twigjs', 'lib/components/base/modal' ], function ( $, _, Twig, Modal ) {
  let CustomWidget = function () {
    let self = this;

    self.isDev = false;

    this.config = {
      baseUrl           : 'https://hub.integrat.pro/Murad/amocrm-usi-mortgage/backend/public',
      name              : 'usiMortgage',
      widgetPrefix      : 'usi-mortgage',
      mortgagePipeline  : self.isDev ? 4799893 : 4691106,
      subdomain         : self.isDev ? 'integrat3' : 'usikuban',
      userDirectorate   : 3071437,
      userAdmin         : 2825410,
      pipelineGub       : 1393867,
      pipelineGubPark   : 4551384,
      pipelineDost      : 3302563,
      pipelineDostPark  : 4703964,

    },

    this.dataStorage = {
      currentModal  : null,
      modalWidth_modalCreateMortgage : '550px',
    },

    this.selectors = {
      mortgageBtn           : `js-${self.config.widgetPrefix}__button`,
      hidden                : `${self.config.widgetPrefix}__hidden`,
      modalCreateBtnConfirm : `${self.config.widgetPrefix}__modal-create-mortgage_confirm`,
      modalCreateBtnCancel  : `${self.config.widgetPrefix}__modal-create-mortgage_cancel`,
      modalCreateBtnConsult : `${self.config.widgetPrefix}__modal-create-mortgage_consult`,

      js : {
        tgRadioInput  : self.isDev ? 'input[id="cf_1037269_617377_"]' : 'input[id="cf_589157_1262797_"]',
        tgPaymentForm : self.isDev ? 'div[data-id="1037269"]' : 'div[data-id="589157"]',  
        rocketSales   : 'li[id="copyLeadTemplatesWidget"]',
      },
    },

    this.getters = {
      getLeadDataById : function ( id, callback ) {
        self.helpers.debug( self.config.name + " << [getter] : getLeadDataById" );

        let lead;

        $.get(
          `${self.config.baseUrl}/lead/${id}`,

          function ( response ) {
            self.helpers.debug( `${self.config.name} << [getter] : getLeadDataById << [getData] : ${response}` );
            self.helpers.debug( response );

            callback( response );
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
      render : function ( template, params, callback = null ) {
        params = ( typeof params == 'object' ) ? params : {};
        template = template || '';

        return self.render(
          {
            href: '/templates/' + template + '.twig',
            base_path: self.params.path,
            v: self.get_version(),
            load: ( template ) => {
              let html = template.render( { data : params } );

              callback.params ? callback.exec( html, callback.params ) : callback.exec( html );
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
      renderMortgageButton : function ( selector, data = null, location = 'append' ) {
        let mortgageButtonData = {
          widgetPrefix : self.config.widgetPrefix,
          isHidden     : !$( self.selectors.js.tgRadioInput )[ 0 ].checked,
          title        : data.title,
        };

        self.renderers.render(
          'mortgageButton',
          mortgageButtonData,

          {
            exec : ( html ) => {
              $( selector )[ location ]( html );
            }
          }
        );
      },

      renderModalCreateMortgage : function () {
        let modalCreateMortgageData = {
          widgetPrefix : self.config.widgetPrefix,
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
            exec : self.renderers.modalWindow.show,
            params : showParams
          }
        );
      },

      modalWindow : {
        objModalWindow: null,

        show : function ( html, modalParams, callback = null, callbackParams = {} ) {
          self.renderers.modalWindow.objModalWindow = new Modal (
            {
              class_name: "modal-window",

              init: function( $modal_body ) {
                let $this = $( this );

                modalParams.sizeParams.width ? $modal_body.css( 'width', modalParams.sizeParams.width ) : $modal_body.css( 'width', 'auto' );
                modalParams.sizeParams.height ? $modal_body.css( 'height', modalParams.sizeParams.height ) : $modal_body.css( 'height', 'auto' );

                $modal_body
                  .append( html )
                  .trigger( 'modal:loaded' )
                  .trigger( 'modal:centrify' );
              },

              destroy: function () {
                console.debug( "close modal-destroy" );

                return true;
              }
            }
          );
        },

        setData : function ( data ) {
          $( 'div.modal-body__inner__todo-types' ).append( data );
        },

        destroy : function () {
          this.objModalWindow.destroy();
        }
      },
    },

    this.handlers = {
      onMortgageBtn : function () {
        self.helpers.debug( self.config.name + " << [handler] : onMortgageBtn" );
        self.helpers.debug( 'self.dataStorage.link: ' + self.dataStorage.link );

        self.getters.getLeadDataById(
          Number( AMOCRM.data.current_card.id ),

          function ( lead ) {
            self.helpers.debug( 'lead data' );
            self.helpers.debug( lead );

            if( lead.data )
            {
              self.helpers.debug( 'Folge dem Link zum Lead: ' );
              self.helpers.debug( lead.data );

              document.location.href = `https://${self.config.subdomain}.amocrm.ru/leads/detail/${lead.data.related_lead}`;
            }
            else
            {
              self.helpers.debug( 'Neues Lead in der Hypothek erstellen: ' );
              self.helpers.debug( lead.data );

              self.renderers.renderModalCreateMortgage();
            }
          }
        );
      },

      selectPaymentForm : function () {
        if ( $( self.selectors.js.tgRadioInput )[ 0 ].checked )
        {
          console.log( 'button zeigen' );

          $( `.${self.selectors.mortgageBtn}` ).removeClass( `${self.selectors.hidden}` );
        }
        else
        {
          console.log( 'button ausblenden' );

          $( `.${self.selectors.mortgageBtn}` ).addClass( `${self.selectors.hidden}` );
        }
      },

      confirmCreateMortgage : function () {
        self.helpers.debug( self.config.name + " << [handler] : confirmCreateMortgage" );

        self.helpers.setDataToModalByConfirm(
          {
            exec    : self.helpers.createMortgage,
            params  : {
              id    : Number( AMOCRM.data.current_card.id ),
              from  : 'confirm',
            }
          }
        );
      },

      cancelCreateMortgage : function () {
        self.helpers.debug( self.config.name + " << [handler] : cancelCreateMortgage" );

        $( 'div.modal-body__inner' ).empty();
        $( 'div.modal-body__inner' ).append(
          `
          <div class="modal-body__inner">
            <span class="modal-body__close">
              <span class="icon icon-modal-close"></span>
            </span>

            <h2 style="text-align: center; font-size: 25px; font-weight: bold;">
              ???????????? ???? ???????? ??????????????
            </h2>
          </div>
          `
        );
      },

      ConsultCreateMortgage : function () {
        self.helpers.debug( self.config.name + " << [handler] : ConsultCreateMortgage" );

        self.helpers.setDataToModalByConfirm(
          {
            exec    : self.helpers.createMortgage,
            params  : {
              id    : Number( AMOCRM.data.current_card.id ),
              from  : 'consult',
            }
          }
        );
      },
    },

    this.actions = {},

    this.helpers = {
      debug : function ( text ) {
        if ( self.isDev ) console.debug( text );
      },

      createMortgage : function ( params ) {
        $.post(
          'https://hub.integrat.pro/Murad/amocrm-usi-mortgage/backend/public/mortgage/create',
          {
            hauptLeadId : params.id,
            from        : params.from,
          },
          function ( data ){
            console.log( data );

            $( '.usi-mortgage__button-inner__text' ).text( '?? ???????????? ??????????????' );
            $( 'div.modal-body__inner' ).empty();
            $( 'div.modal-body__inner' ).append(
              `
              <div class="modal-body__inner">
                <span class="modal-body__close">
                  <span class="icon icon-modal-close"></span>
                </span>

                <h2 style="text-align: center; font-size: 25px; font-weight: bold;">
                  ???????????? ???? ???????????????? ?????? ?????????????? ??????????????????
                </h2>
              </div>
              `
            );
          }
        );
      },

      setDataToModalByConfirm : function ( callback ) {
        $( 'div.modal-body__inner' ).empty();
        $( 'div.modal-body__inner' ).append(
          `
          <div class="modal-body__inner">
            <span class="modal-body__close">
              <span class="icon icon-modal-close"></span>
            </span>

            <h2 style="text-align: center; font-size: 25px; font-weight: bold;">
              ????????????????
            </h2>
          </div>
          `
        );

        callback.params ? callback.exec( callback.params ) : callback.exec();
      },
    },

    this.callbacks = {
      render: function () {
        self.helpers.debug( self.config.name + " << render" );

        self.settings = self.get_settings();

        if ( self.system().area === "lcard" )
        {
          self.helpers.debug( self.config.name + " << wir sind in der Transaktionskarte" );

          if (
            (
              Number( AMOCRM.data.current_card.model.attributes[ "lead[PIPELINE_ID]" ] ) === Number( self.config.pipelineGub )
                ||
              Number( AMOCRM.data.current_card.model.attributes[ "lead[PIPELINE_ID]" ] ) === Number( self.config.pipelineGubPark )
                ||
              Number( AMOCRM.data.current_card.model.attributes[ "lead[PIPELINE_ID]" ] ) === Number( self.config.pipelineDost )
                ||
              Number( AMOCRM.data.current_card.model.attributes[ "lead[PIPELINE_ID]" ] ) === Number( self.config.pipelineDostPark )
                ||
              Number( AMOCRM.data.current_card.model.attributes[ "lead[PIPELINE_ID]" ] ) === Number( self.config.mortgagePipeline )
            )
              &&
            (
              Number( AMOCRM.constant( 'user' ).id ) === Number( self.config.userAdmin )
                ||
              Number( AMOCRM.constant( 'user' ).id ) === Number( self.config.userDirectorate )
            )
          )
          {
            if ( Number( AMOCRM.data.current_card.model.attributes[ "lead[PIPELINE_ID]" ] ) === Number( self.config.mortgagePipeline ) )
            {
              self.helpers.debug( 'wir sind in Hypothek' );

              self.getters.getLeadDataById(
                Number( AMOCRM.data.current_card.id ),

                function ( lead ) {
                  self.helpers.debug( 'lead data' );
                  self.helpers.debug( lead );

                  if( lead.data )
                  {
                    self.dataStorage.link = lead.data.related_lead;

                    self.helpers.debug( 'Hypothekskopfen mit der Addresse zum Hauptlead wird gezeigt: ' );
                    self.helpers.debug( 'lead.data: ' + lead.data );
                    self.helpers.debug( 'link: ' + self.dataStorage.link );

                    self.renderers.renderMortgageButton(
                      self.selectors.js.tgPaymentForm,
                      {
                        title : '?? ???????????????? ????????????'
                      },
                      'after'
                    );
                  }
                  else
                  {
                    self.dataStorage.link = false;

                    self.helpers.debug( 'Hypothekskopfen wird nicht gezeigt: ' );
                    self.helpers.debug( 'lead.data: ' + lead.data );
                    self.helpers.debug( 'link: ' + self.dataStorage.link );
                  }
                }
              );
            }
            else
            {
              self.helpers.debug( 'wir sind nicht in Hypothek' );

              self.getters.getLeadDataById(
                Number( AMOCRM.data.current_card.id ),

                function ( lead ) {
                  self.helpers.debug( 'lead data' );
                  self.helpers.debug( lead );

                  if( lead.data )
                  {
                    self.dataStorage.link = lead.data.related_lead;

                    self.helpers.debug( 'Hypothekskopfen mit der Addresse zum Hypotheklead wird gezeigt: ' );
                    self.helpers.debug( 'lead.data: ' + lead.data );
                    self.helpers.debug( 'link: ' + self.dataStorage.link );

                    self.renderers.renderMortgageButton(
                      self.selectors.js.tgPaymentForm,
                      {
                        title : '?? ???????????? ??????????????'
                      },
                      'after'
                    );
                  }
                  else
                  {
                    self.dataStorage.link = false;

                    self.helpers.debug( 'Hypothekskopfen wird gezeigt, um ein neues Hypotheklead hinzuf??gen: ' );
                    self.helpers.debug( 'lead.data: ' + lead.data );
                    self.helpers.debug( 'link: ' + self.dataStorage.link );

                    self.renderers.renderMortgageButton(
                      self.selectors.js.tgPaymentForm,
                      {
                        title : '?????????????? ???????????? ?? ?????????????? "??????????????"'
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

        self.helpers.debug( self.config.name + " << init" );

        if ( !$( `link[href="${self.settings.path}/style.css?v=${self.settings.version}"]` ).length )
        {
          $( "head" ).append( '<link type="text/css" rel="stylesheet" href="' + self.settings.path + '/style.css?v=' + self.settings.version + '">' );
        }

        return true;
      },

      bind_actions: function () {
        self.helpers.debug( self.config.name + " << bind_actions" );

        if ( !document[ self.config.name ] )
        {
          self.helpers.debug( `${self.config.name} does not exist` );

          document[ self.config.name ] = true;

          $( document ).on( 'click', `.${self.selectors.mortgageBtn}`, self.handlers.onMortgageBtn );
          $( document ).on( 'click', `${self.selectors.js.tgPaymentForm}`, self.handlers.selectPaymentForm );
          $( document ).on( 'click', `.${self.selectors.modalCreateBtnConfirm}`, self.handlers.confirmCreateMortgage );
          $( document ).on( 'click', `.${self.selectors.modalCreateBtnCancel}`, self.handlers.cancelCreateMortgage );
          $( document ).on( 'click', `.${self.selectors.modalCreateBtnConsult}`, self.handlers.ConsultCreateMortgage );
        }
        else
        {
          self.helpers.debug( `${self.config.name} exists` );
        }

        return true;
      },

      settings: function () {
        self.helpers.debug( self.config.name + " << settings" );

        return true;
      },

      onSave: function () {
        self.helpers.debug( self.config.name + " << onSave" );

        return true;
      },

      destroy: function () {
        self.helpers.debug( self.config.name + " << destroy" );
      },

      contacts: {
        //select contacts in list and clicked on widget name
        selected: function () {
          self.helpers.debug( self.config.name + " << contacts selected" );
        }
      },

      leads: {
        //select leads in list and clicked on widget name
        selected: function () {
          self.helpers.debug( self.config.name + " << leads selected" );
        }
      },

      tasks: {
        //select taks in list and clicked on widget name
        selected: function () {
          self.helpers.debug( self.config.name + " << tasks selected" );
        }
      },

      advancedSettings: function () {
        self.helpers.debug( self.config.name + " << advancedSettings" );

        return true;
      },

      /**
       * ?????????? ??????????????????????, ?????????? ???????????????????????? ?? ???????????????????????? Salesbot ?????????????????? ???????? ???? ?????????????????? ??????????????.
       * ???? ???????????? ?????????????? JSON ?????? salesbot'??
       *
       * @param handler_code - ?????? ????????????????, ?????????????? ???? ??????????????????????????. ???????????? ?? manifest.json, ?? ?????????????? ?????????? handler_code
       * @param params - ???????????????????? ?????????????????? ??????????????. ???????????? ??????????:
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