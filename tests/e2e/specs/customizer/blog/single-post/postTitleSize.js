import {
	createURL,
	createNewPost,
	publishPost,
} from '@wordpress/e2e-test-utils';
import { setCustomize } from '../../../../utils/customize';
describe( 'post title size in the customizer', () => {
	it( 'page title size should apply corectly', async () => {
		const postTitle = {
			'font-size-entry-title': {
				desktop: 22,
				tablet: 20,
				mobile: 18,
				'desktop-unit': 'px',
				'tablet-unit': 'px',
				'mobile-unit': 'px',
			},
		};
		await setCustomize( postTitle );
		await createNewPost( { postType: 'post', title: 'hello world' } );
		await publishPost();
		await page.goto( createURL( '/hello-world/' ), {
			waitUntil: 'networkidle0',
		} );
		await page.waitForSelector( '.ast-single-post .entry-title' );

		await expect( {
			selector: '.ast-single-post .entry-title',
			property: 'font-size',
		} ).cssValueToBe(
			`${ postTitle[ 'font-size-entry-title' ].desktop }${ postTitle[ 'font-size-entry-title' ][ 'desktop-unit' ] }`,
		);
	} );
} );
