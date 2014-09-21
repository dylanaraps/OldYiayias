
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require, exports, module);
  } else {
    root.scrollReveal = factory();
  }
}(this, function(require, exports, module) {

/*
                       _ _ _____                      _   _
                      | | |  __ \                    | | (_)
    ___  ___ _ __ ___ | | | |__) |_____   _____  __ _| |  _ ___
   / __|/ __| '__/ _ \| | |  _  // _ \ \ / / _ \/ _` | | | / __|
   \__ \ (__| | | (_) | | | | \ \  __/\ V /  __/ (_| | |_| \__ \
   |___/\___|_|  \___/|_|_|_|  \_\___| \_/ \___|\__,_|_(_) |___/ v.0.2.0
                                                        _/ |
                                                       |__/

    "Declarative on-scroll reveal animations."

============================================================================*/

/**
 * scrollReveal.js (c) 2014 Julian Lloyd (@julianlloyd)
 *
 * Inspired by cbpScroller.js (c) 2014 Codrops (@crnacura)
 *
 * Licensed under the MIT license
 * http://www.opensource.org/licenses/mit-license.php
 */

window.scrollReveal = (function( window ) {

  'use strict'

  var _requestAnimFrame
    , _eventHandler
    , serial
    , self

  function scrollReveal( config ) {

      self         = this
      self.data    = {}
      self.elems   = []
      self.serial  = 1
      self.config  = self.extend( self.defaults, config )
      self.docElem = self.config.elem

      /**
       * check for a mobile browsers, and pull the plug if on
       * a mobile device and config.mobile is currently false
       */
      if ( self.isMobile() && !self.config.mobile, self.config.tablet ) {

        return /* Goodbye… */

      } else if ( self.config.init == true ) {

        self.init()

      }
  }



  scrollReveal.prototype = {

    defaults: {

      after:  '0s',     /* delay    */
      enter:  'top',    /* vector   */
      move:   '0',      /* distance */
      over:   '0.5s',   /* duration */

      easing: 'ease-out',
      opacity: 0,

      /**
       * Callback function that fires after an element finishes its animation.
       *
       * NOTE: animations that reset do not complete.
       */
      complete: function( el ) {},

      /**
       * <HTML> is the default parent element, but this can be changed
       * in the config object; e.g.:
       *
       *   new scrollReveal({ elem: document.getElementById( 'sr-container' ) })
       */
      elem: window.document.documentElement,

      /**
       * true, init() is called during upon instantiation
       * false, init() must be called manually
       */
      init: true,

      /**
       * true, enables scrollReveal on mobile devices
       * false, disabled scrollReveal on mobile devices
       */
      mobile: false,

      /**
       * true, animations occur each time an element enters the viewport
       * false, animations occur only once
       */
      reset: false,

      /**
       * 1, the element is considered in the viewport when it's fully visible
       * 0, the element is considered in the viewport as soon as it enters
       */
      viewportFactor: 0.4
    },

    /**
     * performs a fresh query of the DOM for data-sr attributes,
     * and binds event listeners to the returned elements
     */
    init: function() {

      var id

      self.elems = Array.prototype.slice.call( window.document.querySelectorAll( '[data-sr]' ) )
      self.elems.forEach(function ( el ) {

        id = self.serial++
        /**
         * if no data-sr-id attribute is found, apply it and create a
         * new member in self.data
         */
        if ( !el.getAttribute( 'data-sr-id' ) ) {

          self.data[ id ] = {}
          el.setAttribute( 'data-sr-id', id )

        } else {

          /**
           * Otherwise, Skip this element’s setup...
           */
          return
        }

        /**
         * if no style property has been set, create one using the value from
         * the element's existing style tag — otherwise initialise an empty string
         */
        if ( typeof self.data[ id ].style === 'undefined' ) {

          self.data[ id ].style = el.getAttribute( 'style' ) + ';'

        }

        window.addEventListener( 'scroll', _eventHandler, false )
        window.addEventListener( 'resize', _eventHandler, false )

      })

      self.eventBlocked = false

      /**
       * TODO: refactor the config object and init() method so that DOM traversal de-couples from firing the animate() method
       * if( self.config.init ) {
        */
      self.animate()

    },

    animate: function() {

      self.elems.forEach(function ( el ) {

        var id
          , css
          , data

        /**
         * first, let’s skip any (non-reseting) elements that have completed their reveal
         */
        if ( el.getAttribute( 'data-sr-complete' ) ) {

          return

        }

        /**
         * find the elements id, and set `el` to its corresponding self.data object
         */
        id = el.getAttribute( 'data-sr-id' )

        if ( id ) {

          data = self.data[ id ]

          /**
           * now lets check for cached styles, and generated any that are missing
           */
          if ( !data.css ) {

            data.css = self.createStyles( el, data )
          }

          if ( !el.getAttribute( 'data-sr-init' ) ) {

            el.setAttribute( 'style', data.style + data.css.initial )
            el.setAttribute( 'data-sr-init', true )

          }

          /**
           * if the element isn’t visible, check whether we should apply reset styles
           */
          if ( !self.isElementInViewport( el, self.config.viewportFactor ) ) {

            if ( data.reset ) {

              el.setAttribute( 'style', data.style + data.css.initial + data.css.reset )

            }

            return
          }


          /**
           * if our element is visible, apply target styles
           */
          if ( self.isElementInViewport( el, self.config.viewportFactor ) ) {

            el.setAttribute( 'style', data.style + data.css.target + data.css.transition )

            /**
             * and if reset is disabled for this element, restore the style attribute
             * to it’s pre-scrollReveal state after the animation completes
             */
            if ( !data.reset ) {

              setTimeout(function () {

                if ( data.style !== '' ) {

                  el.setAttribute( 'style', data.style )

                } else {

                  el.removeAttribute( 'style' )
                }

                /**
                 * animation complete, fire callback...
                 */
                el.setAttribute( 'data-sr-complete', true )
                self.config.complete( el )

              }, data.css.totalDuration )
            }

            return
          }

        }

      }) // end self.elems.forEach

      self.eventBlocked = false

    },

    parse: function( el ) {

      var words  = el.getAttribute( 'data-sr' ).split( /[, ]+/ )
        , parsed = {}

      words = self.filter( words )

      words.forEach(function( keyword, i ) {

        /**
         * keywords are immediately followed by a value (after parsing out any filler words)
         * so upon finding a match, we grab the following value in the array
         */
        switch ( keyword ) {

          case "enter":

            parsed.enter = words[ i + 1 ]
            return

          case "after":

            parsed.after = words[ i + 1 ]
            return

          case "wait":

            parsed.after = words[ i + 1 ]
            return

          case "move":

            parsed.move = words[ i + 1 ]
            return

          case "ease":

            parsed.move = words[ i + 1 ]
            parsed.ease = "ease"
            return

          case "ease-in":

            parsed.move = words[ i + 1 ]
            parsed.easing = "ease-in"
            return

          case "ease-in-out":

            parsed.move = words[ i + 1 ]
            parsed.easing = "ease-in-out"
            return

          case "ease-out":

            parsed.move = words[ i + 1 ]
            parsed.easing = "ease-out"
            return

          case "over":

            parsed.over = words[ i + 1 ]
            return

          /**
           * make sure any reset config override is caught…
           */
          case "reset":

            if ( words[ i - 1 ] == 'no' ) {

              parsed.reset = false

            } else {

              parsed.reset = true
            }

            return

          default:
            return
        }
      })

      /**
       * if no reset keyword is found, assign the value specified in the config
       */
      if ( typeof parsed.reset === 'undefined' ) parsed.reset = self.config.reset

      return parsed
    },

    createStyles: function( el, data ) {

      var parsed
        , enter
        , axis
        , dist
        , dur
        , delay
        , easing
        , opacity

        , transition
        , reset
        , initial
        , target


      /**
       * parse for keywords, and update our data model's reset config
       */
      parsed = self.parse( el )
      data.reset = parsed.reset

      /**
       * convert the vector origin to a CSS-friendly axis
       */
      if ( parsed.enter ) {

        if ( parsed.enter == 'top' || parsed.enter == 'bottom' ) {

          enter = parsed.enter
          axis = 'y'
        }

        if ( parsed.enter == 'left' || parsed.enter == 'right' ) {

          enter = parsed.enter
          axis = 'x'
        }

      } else {

        if ( self.config.enter == 'top' || self.config.enter == 'bottom' ) {

          enter = self.config.enter
          axis = 'y'
        }

        if ( self.config.enter == 'left' || self.config.enter == 'right' ) {

          enter = self.config.enter
          axis = 'x'
        }
      }

      /**
       * after all values are parsed, let’s make sure our our
       * pixel distance is negative for top and left entrances.
       *
       * ie. "move 25px from top" starts at 'top: -25px' in CSS.
       */
      if ( enter == "top" || enter == "left" ) {

        if ( parsed.move ) {

          parsed.move = "-" + parsed.move

        }
        else {

          parsed.move = "-" + self.config.move
        }
      }


      /**
       * assign values to CSS variables
       */
      dist    = parsed.move     || self.config.move
      dur     = parsed.over     || self.config.over
      delay   = parsed.after    || self.config.after
      easing  = parsed.easing   || self.config.easing
      opacity = parsed.opacity  || self.config.opacity

      /**
       * Want to disable delay on mobile devices? It might provide a better UX
       * considering the animations are paused during scroll… uncomment the line below
       */
      if ( self.isMobile() && self.config.mobile ) { delay = 0; }

      transition = '-webkit-transition: -webkit-transform ' + dur + ' ' + easing + ' ' + delay + ', opacity ' + dur + ' ' + easing + ' ' + delay + ';' +
                           'transition: transform '         + dur + ' ' + easing + ' ' + delay + ', opacity ' + dur + ' ' + easing + ' ' + delay + ';' +
                  '-webkit-perspective: 1000;' +
          '-webkit-backface-visibility: hidden;'

      /**
       * create a duplicate transition style, but with no delay for better exit animation UX
       */
      reset      = '-webkit-transition: -webkit-transform ' + dur + ' ' + easing + ' 0s, opacity ' + dur + ' ' + easing + ' ' + delay + ';' +
                           'transition: transform '         + dur + ' ' + easing + ' 0s, opacity ' + dur + ' ' + easing + ' ' + delay + ';' +
                  '-webkit-perspective: 1000;' +
          '-webkit-backface-visibility: hidden;'

      initial     = '-webkit-transform: translate' + axis + '(' + dist + ');' +
                            'transform: translate' + axis + '(' + dist + ');' +
                              'opacity: ' + opacity + ';'

      target      = '-webkit-transform: translate' + axis + '(0);' +
                            'transform: translate' + axis + '(0);' +
                              'opacity: 1;'

      return {
        transition: transition,
        initial: initial,
        target: target,
        reset: reset,
        totalDuration: ( ( parseFloat( dur ) + parseFloat( delay ) ) * 1000 )
      }
    },

    filter: function( words ) {

      var filtered  = []
        , blacklist = []

      blacklist = [
        'a',
        'and',
        'but',
        'from',
        'the',
        'then',
        'with',
      ]

      /**
       * check each word in the array
       * if the value is found in the blacklist, skip it
       * otherwise, add the word to a new array to be returned
       */
      words.forEach(function( word, i ) {

        if ( blacklist.indexOf( word ) > -1 ) {

          return
        }

        filtered.push( word )
      })

      return filtered
    },

    getViewportH: function() {

      var client = self.docElem[ 'clientHeight' ]
        , inner  = window[ 'innerHeight' ]

      if ( self.docElem == window.document.documentElement ) {

        return ( client < inner ) ? inner : client
      }

      else return client
    },

    getOffset: function( el ) {

      var offsetTop  = 0
        , offsetLeft = 0

      do {

        if ( !isNaN( el.offsetTop ) ) { offsetTop += el.offsetTop }
        if ( !isNaN( el.offsetLeft ) ) { offsetLeft += el.offsetLeft }

      } while ( el = el.offsetParent )

      return {
        top: offsetTop,
        left: offsetLeft
      }
    },

    isElementInViewport: function( el, viewportFactor ) {

      if ( self.docElem == window.document.documentElement )
           var scrolled  = window.pageYOffset
      else var scrolled  = self.docElem.scrollTop + self.docElem.offsetTop

      var elHeight       = el.offsetHeight
        , elTop          = self.getOffset( el ).top
        , elBottom       = elTop + elHeight

        , viewed         = scrolled + self.getViewportH()
        , viewportFactor = viewportFactor || 0

      return ( elTop + elHeight * viewportFactor ) <= viewed
          && ( elBottom ) >= scrolled
          || ( el.currentStyle? el.currentStyle : window.getComputedStyle( el, null ) ).position == 'fixed'
    },

    isMobile: function() {

      var agent = navigator.userAgent||navigator.vendor||window.opera

      return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test( agent )||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test( agent.substr( 0, 4 ))) ? true : false
    },

    extend: function( a, b ) {

      for ( var key in b ) {

        if ( b.hasOwnProperty( key ) ) {

          a[ key ] = b[ key ]
        }
      }

      return a
    },

  } // end scrollReveal.prototype

  /**
   * RequestAnimationFrame polyfill
   * @function
   * @private
   */
  _requestAnimFrame = (function () {

    return window.requestAnimationFrame        ||
           window.webkitRequestAnimationFrame  ||
           window.mozRequestAnimationFrame     ||

          function( callback ) {

            window.setTimeout( callback, 1000 / 60 )
          }
  }())

  _eventHandler = function( e ) {

    if ( !self.eventBlocked ) {

      self.eventBlocked = true
      _requestAnimFrame(function() {

        self.animate()
      })
    }
  }

  return scrollReveal

})( window );

return scrollReveal;

}));
