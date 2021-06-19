/**
 * External dependencies
 */
 import { get } from 'lodash';

 import fetch from 'node-fetch';

 /**
  * WordPress dependencies
  */
 import {
	 clearLocalStorage,
	 enablePageDialogAccept,
	 isOfflineMode,
	 setBrowserViewport,
	 trashAllPosts,
 } from '@wordpress/e2e-test-utils';

 /**
  * Environment variables
  */
 const { PUPPETEER_TIMEOUT } = process.env;

 /**
  * Set of console logging types observed to protect against unexpected yet
  * handled (i.e. not catastrophic) errors or warnings. Each key corresponds
  * to the Puppeteer ConsoleMessage type, its value the corresponding function
  * on the console global object.
  *
  * @type {Object<string,string>}
  */
 const OBSERVED_CONSOLE_MESSAGE_TYPES = {
	 warning: 'warn',
	 error: 'error',
 };

 /**
  * Array of page event tuples of [ eventName, handler ].
  *
  * @type {Array}
  */
 const pageEvents = [];

 // The Jest timeout is increased because these tests are a bit slow
 jest.setTimeout( PUPPETEER_TIMEOUT || 300000 );

 /**
  * Adds an event listener to the page to handle additions of page event
  * handlers, to assure that they are removed at test teardown.
  */
 function capturePageEventsForTearDown() {
	 page.on( 'newListener', ( eventName, listener ) => {
		 pageEvents.push( [ eventName, listener ] );
	 } );
 }

 /**
  * Removes all bound page event handlers.
  */
 function removePageEvents() {
	 pageEvents.forEach( ( [ eventName, handler ] ) => {
		 page.removeListener( eventName, handler );
	 } );
 }

 /**
  * Adds a page event handler to emit uncaught exception to process if one of
  * the observed console logging types is encountered.
  */
 function observeConsoleLogging() {
	 page.on( 'console', ( message ) => {
		 const type = message.type();
		 if ( ! OBSERVED_CONSOLE_MESSAGE_TYPES.hasOwnProperty( type ) ) {
			 return;
		 }

		 let text = message.text();

		 // An exception is made for _blanket_ deprecation warnings: Those
		 // which log regardless of whether a deprecated feature is in use.
		 if ( text.includes( 'This is a global warning' ) ) {
			 return;
		 }

		 // A chrome advisory warning about SameSite cookies is informational
		 // about future changes, tracked separately for improvement in core.
		 //
		 // See: https://core.trac.wordpress.org/ticket/37000
		 // See: https://www.chromestatus.com/feature/5088147346030592
		 // See: https://www.chromestatus.com/feature/5633521622188032
		 if (
			 text.includes( 'A cookie associated with a cross-site resource' )
		 ) {
			 return;
		 }

		 // Viewing posts on the front end can result in this error, which
		 // has nothing to do with Gutenberg.
		 if ( text.includes( 'net::ERR_UNKNOWN_URL_SCHEME' ) ) {
			 return;
		 }

		 // Network errors are ignored only if we are intentionally testing
		 // offline mode.
		 if (
			 text.includes( 'net::ERR_INTERNET_DISCONNECTED' ) &&
			 isOfflineMode()
		 ) {
			 return;
		 }

		 // As of WordPress 5.3.2 in Chrome 79, navigating to the block editor
		 // (Posts > Add New) will display a console warning about
		 // non - unique IDs.
		 // See: https://core.trac.wordpress.org/ticket/23165
		 if ( text.includes( 'elements with non-unique id #_wpnonce' ) ) {
			 return;
		 }

		 // As of WordPress 5.3.2 in Chrome 79, navigating to the block editor
		 // (Posts > Add New) will display a console warning about
		 // non - unique IDs.
		 // See: https://core.trac.wordpress.org/ticket/23165
		 if ( text.includes( 'elements with non-unique id #_wpnonce' ) ) {
			 return;
		 }

		 // WordPress still bundles jQuery Migrate, which logs to the console.
		 if ( text.includes( 'JQMIGRATE' ) ) {
			 return;
		 }

		 const logFunction = OBSERVED_CONSOLE_MESSAGE_TYPES[ type ];

		 // As of Puppeteer 1.6.1, `message.text()` wrongly returns an object of
		 // type JSHandle for error logging, instead of the expected string.
		 //
		 // See: https://github.com/GoogleChrome/puppeteer/issues/3397
		 //
		 // The recommendation there to asynchronously resolve the error value
		 // upon a console event may be prone to a race condition with the test
		 // completion, leaving a possibility of an error not being surfaced
		 // correctly. Instead, the logic here synchronously inspects the
		 // internal object shape of the JSHandle to find the error text. If it
		 // cannot be found, the default text value is used instead.
		 text = get(
			 message.args(),
			 [ 0, '_remoteObject', 'description' ],
			 text,
		 );

		 // Disable reason: We intentionally bubble up the console message
		 // which, unless the test explicitly anticipates the logging via
		 // @wordpress/jest-console matchers, will cause the intended test
		 // failure.

		 // eslint-disable-next-line no-console
		 console[ logFunction ]( text );
	 } );
 }

 /**
  * Runs Axe tests when the block editor is found on the current page.
  *
  * @return {?Promise} Promise resolving once Axe texts are finished.
  */
 async function runAxeTestsForBlockEditor() {
	 if ( ! await page.$( '.block-editor' ) ) {
		 return;
	 }

	 await expect( page ).toPassAxeTests( {
		 /**
		  * Rules are disabled, as there are still accessibility issues within gutenberg.
		  *
		  * See: https://github.com/WordPress/gutenberg/pull/15018 & https://github.com/WordPress/gutenberg/issues/15452
		  */
		 disabledRules: [
			 'aria-allowed-role',
			 'aria-valid-attr-value',
			 'button-name',
			 'color-contrast',
			 'dlitem',
			 'duplicate-id',
			 'label',
			 'link-name',
			 'listitem',
			 'region',
		 ],
		 exclude: [
			 // Ignores elements created by metaboxes.
			 '.edit-post-layout__metaboxes',
			 // Ignores elements created by TinyMCE.
			 '.mce-container',
		 ],
	 } );
 }

 /**
  * Set up browser.
  */
 async function setupBrowser() {
	 await setBrowserViewport( {
		 width: 1600,
		 height: 1000,
	 } );
 }

/**
 * Reset the site to default settings.
 */
 async function siteReset() {
	await fetch( 'http://localhost:8890/wp-json/astra/v1/e2e-utils/reset-theme', {
        method: 'DELETE',
    });
 }

 /**
  * Before every test suite run, delete all content created by the test. This ensures
  * other posts/comments/etc. aren't dirtying tests and tests don't depend on
  * each other's side-effects.
  */
 // eslint-disable-next-line jest/require-top-level-describe
 beforeAll( async () => {
	 capturePageEventsForTearDown();
	 enablePageDialogAccept();
	 observeConsoleLogging();
	 await setupBrowser();
	 await trashAllPosts();
	 await siteReset();
	 await page.setDefaultNavigationTimeout( 10000 );
	 await page.setDefaultTimeout( 10000 );
 } );

 // eslint-disable-next-line jest/require-top-level-describe
 afterEach( async () => {
	 await clearLocalStorage();
	 await runAxeTestsForBlockEditor();
	 await setupBrowser();
 } );

 // eslint-disable-next-line jest/require-top-level-describe
 afterAll( () => {
	 removePageEvents();
 } );

 /**
  * `expect` extension to count the number of elements with a given selector on the page.
  */
 expect.extend( {
	 async countToBe( selector, expected ) {
		 const count = await page.$$eval( selector, ( els ) => els.length );

		 if ( count !== expected ) {
			 return {
				 pass: false,
				 message: () => `Expected ${ expected } elements for selector ${ selector }. Received ${ count }.`,
			 };
		 }

		 return {
			 pass: true,
			 message: () => `Expected ${ expected } elements for selector ${ selector }.`,
		 };
	 },
 } );
