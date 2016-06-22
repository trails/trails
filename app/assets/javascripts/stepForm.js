;( function( window ) {
  'use strict';

  var
    transEndEventNames = {
      'WebkitTransition': 'webkitTransitionEnd',
      'MozTransition': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'msTransition': 'MSTransitionEnd',
      'transition': 'transitionend'
    },
    transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
    support = { transitions : Modernizr.csstransitions };

  function extend( a, b ) {
    for( var key in b ) {
      if( b.hasOwnProperty( key ) ) {
        a[key] = b[key];
      }
    }
    return a;
  }

  function stepForm( el, options ) {
    this.el = el;
    this.options = extend( {}, this.options );
    extend( this.options, options );
    this._init();
  }

  stepForm.prototype.options = {
    onSubmit : function(el) {
      var submit = el.querySelector('[type="submit"]');
      if (submit) {
        submit.click();
      }
      return false;
    }
  };

  stepForm.prototype._init = function() {
    this.reset();
    // init events
    this._initEvents();
  };

  stepForm.prototype.reset = function() {
    // current question
    this.current = 0;

    var current = this.el.querySelector('ol.questions > li.current');
    if (current) {
      current.removeClassName('current');
    }

    // questions
    this.questions = [].slice.call( this.el.querySelectorAll( 'ol.questions > li' ) );
    // total questions
    this.questionsCount = this.questions.length;
    // show first question

    this.questions[0].addClassName('current');

    // next question control
    this.ctrlNext = this.el.querySelector( 'button.next' );

    // error message
    this.error = this.el.querySelector( 'span.error-message' );

    this.isFilled = false;

    var self = this,
      // first input
      firstElInput = this.questions[ this.current ].querySelector( 'input' ),
      // focus
      onFocusStartFn = function() {
        firstElInput.removeEventListener( 'focus', onFocusStartFn );
        self.ctrlNext.addClassName('show');
      };

    // show the next question control first time the input gets focused
    firstElInput.addEventListener( 'focus', onFocusStartFn );
  };

  stepForm.prototype._initEvents = function() {
    var self = this;

    // show next question
    this.ctrlNext.addEventListener( 'click', function( ev ) {
      ev.preventDefault();
      if (self.current == 0) {
        self._queryID();
      } else {
        self.nextQuestion();
      }

    } );

    this.questions.each(function (item) {
      item.querySelector('input').addEventListener('keydown', function (ev) {
        var keyCode = ev.keyCode || ev.which;
        // pressing enter will jump to next question
        if( keyCode === 13 ) {
          ev.preventDefault();
          if (self.current == 0) {
            self._queryID();
          } else {
            self.nextQuestion();
          }
        }
        // disable tab
        if( keyCode === 9 ) {
          ev.preventDefault();
        }
      });
    });
  };

  stepForm.prototype._queryID = function() {
    var question = this.questions[ 0 ];
    if (typeof this.options.onIDQuery == 'undefined' || this.options.onIDQuery(question)) {
      return this.nextQuestion();
    };
  };

  stepForm.prototype.nextQuestion = function() {
    if (this.current > this.questionsCount -1 || !this._validate()) {
      return false;
    }

    // check if form is filled
    if (this.current === this.questionsCount -1) {
      this.isFilled = true;
    }

    // clear any previous error messages
    this._clearError();

    // current question
    var currentQuestion = this.questions[this.current];

    // increment current question iterator
    ++this.current;

    if (this.isFilled) {
      this._submit();
    } else {
      // add class "show-next" to form element (start animations)
      this.el.addClassName('show-next');

      // remove class "current" from current question and add it to the next one
      // current question
      var nextQuestion = this.questions[this.current];
      currentQuestion.removeClassName('current');
      nextQuestion.addClassName('current');

      this.el.removeClassName('show-next');
      // force the focus on the next input
      nextQuestion.querySelector('input').focus();
    }
  }

  // submits the form
  stepForm.prototype._submit = function() {
    this.options.onSubmit(this.el);
  }

  // TODO (next version..)
  // the validation function
  stepForm.prototype._validate = function() {
    // current question´s input
    var input = this.questions[this.current].querySelector('input').value;
    if (input === '') {
      this._showError('EMPTYSTR');
      return false;
    }
    return true;
  }

  // TODO (next version..)
  stepForm.prototype._showError = function( err ) {
    var message = '';
    switch( err ) {
      case 'EMPTYSTR' :
        message = 'Please fill the field before continuing';
        break;
      case 'INVALIDEMAIL' :
        message = 'Please fill a valid email address';
        break;
      // ...
    };
    this.error.innerHTML = message;
    this.error.addClassName('show');
  }

  // clears/hides the current error message
  stepForm.prototype._clearError = function() {
    this.error.removeClassName('show');
  }

  // add to global namespace
  window.stepForm = stepForm;

})( window );
