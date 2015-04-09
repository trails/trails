/**
 * stepsForm.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2014, Codrops
 * http://www.codrops.com
 */
;( function( window ) {

    'use strict';

    function extend( a, b ) {
        for( var key in b ) {
            if( b.hasOwnProperty( key ) ) {
                a[key] = b[key];
            }
        }
        return a;
    }

    function stepsForm( el, options ) {
        this.el = el;
        this.options = extend( {}, this.options );
        extend( this.options, options );
        this._init();
    }

    stepsForm.prototype.options = {
        onSubmit: function () {
            return false;
        },
        onKeyDown: function () {
            return true;
        },
        beforeNextQuestion: function() {
            return true;
        }
    };

    stepsForm.prototype._init = function() {
        this.reset();
        // init events
        this._initEvents();
    };

    stepsForm.prototype.reset = function() {

        // current question
        this.current = 0;

        // questions
        var current = this.el.querySelector('ol.questions > li.current');
        if (current) {
            current.removeClassName('current');
        }
        this.questions = [].slice.call( this.el.querySelectorAll( 'ol.questions > li' ) );
        // total questions
        this.questionsCount = this.questions.length;
        // show first question

        this.questions[0].addClassName('current');

        // next question control
        this.ctrlNext = this.el.querySelector( 'button.next' );

        // progress bar
        this.progress = this.el.querySelector( 'div.progress' );
        this.progress.removeAttribute('style');

        // question number status
        this.questionStatus = this.el.querySelector( 'span.number' );
        // current question placeholder
        this.currentNum = this.questionStatus.querySelector( 'span.number-current' );
        this.currentNum.innerHTML = Number( this.current + 1 );
        // total questions placeholder
        this.totalQuestionNum = this.questionStatus.querySelector( 'span.number-total' );
        this.totalQuestionNum.innerHTML = this.questionsCount;

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

    stepsForm.prototype._initEvents = function() {
        var self = this;

        // show next question
        this.ctrlNext.addEventListener( 'click', function( ev ) {
            ev.preventDefault();
            if( !self._validate() ) {
                return false;
            }
            if (self.options.beforeNextQuestion()) {
                self._nextQuestion();
            }
        } );

        this.questions.each(function (item) {
            item.querySelector('input').addEventListener('keydown', function (ev) {
                var keyCode = ev.keyCode || ev.which;
                // pressing enter will jump to next question
                if( keyCode === 13 ) {
                    ev.preventDefault();
                    if( !self._validate() ) {
                        return false;
                    }
                    if (self.options.beforeNextQuestion()) {
                        self._nextQuestion();
                    }
                }
                // disable tab
                if( keyCode === 9 ) {
                    ev.preventDefault();
                }
            });
            item.querySelector('input').addEventListener('input', function (ev) {
                self.options.onInput(ev);
            });
        });
    };

    stepsForm.prototype._nextQuestion = function() {
        // check if form is filled
        if( this.current === this.questionsCount - 1 ) {
            this.isFilled = true;
        }

        // clear any previous error messages
        this._clearError();

        // current question
        var currentQuestion = this.questions[ this.current ];

        // increment current question iterator
        ++this.current;

        // update progress bar
        this._progress();

        if( !this.isFilled ) {
            // change the current question number/status
            this._updateQuestionNumber();

            // add class "show-next" to form element (start animations)
            this.el.addClassName('show-next');

            // remove class "current" from current question and add it to the next one
            // current question
            var nextQuestion = this.questions[ this.current ];
            currentQuestion.removeClassName('current');
            nextQuestion.addClassName('current');
        }

        // after animation ends, remove class "show-next" from form element and change current question placeholder
        var self = this,
            onEndTransitionFn = function( ev ) {
                this.removeEventListener( 'transitionend', onEndTransitionFn );
                if( self.isFilled ) {
                    self._submit();
                }
                else {
                    self.el.removeClassName('show-next');
                    self.currentNum.innerHTML = self.nextQuestionNum.innerHTML;
                    self.questionStatus.removeChild( self.nextQuestionNum );
                    // force the focus on the next input
                    nextQuestion.querySelector( 'input' ).focus();
                }
            };

        this.progress.addEventListener( 'transitionend', onEndTransitionFn );
    }

    // updates the progress bar by setting its width
    stepsForm.prototype._progress = function() {
        this.progress.style.width = this.current * ( 100 / this.questionsCount ) + '%';
    }

    // changes the current question number
    stepsForm.prototype._updateQuestionNumber = function() {
        // first, create next question number placeholder
        this.nextQuestionNum = document.createElement( 'span' );
        this.nextQuestionNum.className = 'number-next';
        this.nextQuestionNum.innerHTML = Number( this.current + 1 );
        // insert it in the DOM
        this.questionStatus.appendChild( this.nextQuestionNum );
    }

    // submits the form
    stepsForm.prototype._submit = function() {
        this.options.onSubmit( this.el );
    }

    // TODO (next version..)
    // the validation function
    stepsForm.prototype._validate = function() {
        // current questionÂ´s input
        var input = this.questions[ this.current ].querySelector( 'input' ).value;
        if( input === '' ) {
            this._showError( 'EMPTYSTR' );
            return false;
        }

        return true;
    }

    // TODO (next version..)
    stepsForm.prototype._showError = function( err ) {
        var message = '';
        switch( err ) {
            case 'EMPTYSTR':
                message = 'Please fill the field before continuing';
                break;
            case 'INVALIDEMAIL':
                message = 'Please fill a valid email address';
                break;
            // ...
        };
        this.error.innerHTML = message;
        this.error.addClassName('show');
    }

    // clears/hides the current error message
    stepsForm.prototype._clearError = function() {
        this.error.removeClassName('show');
    }

    // add to global namespace
    window.stepsForm = stepsForm;

})( window );