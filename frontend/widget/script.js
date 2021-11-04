define( [ 'jquery', 'underscore', 'twigjs', 'lib/components/base/modal' ], function ( $, _, Twig, Modal ) {
  let CustomWidget = function () {
    let self = this;

    self.isDev = true;

    this.config = {
      baseUrl           : 'https://hub.integrat.pro/Murad/amocrm-usi-mortgage/backend/public',
      name              : 'usiMortgage',
      widgetPrefix      : 'usi-mortgage',
      mortgagePipeline  : self.isDev ? 4799893 : 4691106,
    },

    this.dataStorage = {
      currentModal  : null,
      link          : null,
    },

    this.selectors = {
      mortgageBtn : `${self.config.widgetPrefix}__button`,
      hidden      : `${self.config.widgetPrefix}__hidden`,

      js : {
        tgRadioInput  : self.isDev ? 'input[id="cf_1037269_617377_"]' : '',
        tgPaymentForm : self.isDev ? 'div[data-id="1037269"]' : '',  
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

      modalWindow: {
        show: function ( html, modalParams, callback = false, callbackParams = {} ) {
          self.dataStorage.flags.modalEvent = true;

          self.dataStorage.currentModal = new Modal (
            {
              class_name: "modal-window",

              init: function( $modal_body ) {
                self.currentModal = $( this );

                console.debug( '$modal_body:' );
                console.debug( self.currentModal );

                modalParams.sizeParams.width ? $modal_body.css( 'width', modalParams.sizeParams.width ) : $modal_body.css( 'width', 'auto' );
                modalParams.sizeParams.height ? $modal_body.css( 'height', modalParams.sizeParams.height ) : $modal_body.css( 'height', 'auto' );

                $modal_body.css( 'margin-top', '-590px' );
                $modal_body.css( 'margin-left', '-470px' );

                $modal_body
                  .append( html )
                  .trigger( 'modal:loaded' );

                if ( callback )
                {
                  callback();
                }
              },

              destroy: function () {
                console.debug( "close modal-destroy" ); // Debug

                self.dataStorage.flags.modalEvent = false;

                return true;
              }
            }
          );
        },

        setData: function ( data ) {
          $( 'div.modal-body__inner__todo-types' ).append( data );
        },

        destroy: function () {
          self.dataStorage.currentModal.destroy();
        }
      },
    },

    this.handlers = {
      onMortgageBtn : function () {
        self.helpers.debug( self.config.name + " << [handler] : onMortgageBtn" );

        if ( self.dataStorage.link )
        {
          self.helpers.debug( 'Folge dem Link zum Lead' );

          document.location.href = `https://integrat3.amocrm.ru/leads/detail/${self.dataStorage.link}`;
        }
        else
        {
          self.helpers.debug( 'Neues Lead in der Hypothek erstellen' );
        }
      },

      //FIXME
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
    },

    this.actions = {},

    this.helpers = {
      debug : function ( text ) {
        if ( self.isDev ) console.debug( text );
      }
    },

    this.callbacks = {
      render: function () {
        self.helpers.debug( self.config.name + " << render" );

        self.settings = self.get_settings();

        if ( self.system().area === "lcard" )
        {
          self.helpers.debug( self.config.name + " << wir sind in der Transaktionskarte" );

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
                  self.helpers.debug( 'Hypothekskopfen mit der Addresse zum Hauptlead wird gezeigt' );

                  self.dataStorage.link = lead.data.related_lead;

                  self.renderers.renderMortgageButton(
                    self.selectors.js.tgPaymentForm,
                    {
                      title : 'В основную сделку'
                    },
                    'after'
                  );
                }
                else
                {
                  self.helpers.debug( 'Hypothekskopfen wird nicht gezeigt' );
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
                  self.helpers.debug( 'Hypothekskopfen mit der Addresse zum Hypotheklead wird gezeigt' );

                  self.dataStorage.link = lead.data.related_lead;

                  self.renderers.renderMortgageButton(
                    self.selectors.js.tgPaymentForm,
                    {
                      title : 'В сделке ипотека'
                    },
                    'after'
                  );
                }
                else
                {
                  self.helpers.debug( 'Hypothekskopfen wird gezeigt, um ein neues Hypotheklead hinzufügen' );

                  self.renderers.renderMortgageButton(
                    self.selectors.js.tgPaymentForm,
                    {
                      title : 'Создать сделку в воронке "Ипотека"'
                    },
                    'after'
                  );
                }
              }
            );
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
          $( document ).on( 'click', self.selectors.js.tgPaymentForm, self.handlers.selectPaymentForm );
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