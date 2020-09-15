<?php
/**
 * Astra Theme Customizer Configuration Above Header.
 *
 * @package     astra-builder
 * @author      Astra
 * @copyright   Copyright (c) 2020, Astra
 * @link        https://wpastra.com/
 * @since       x.x.x
 */

// No direct access, please.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( class_exists( 'Astra_Customizer_Config_Base' ) ) {

	/**
	 * Register Above Header Customizer Configurations.
	 *
	 * @since x.x.x
	 */
	class Astra_Customizer_Above_Header_Configs extends Astra_Customizer_Config_Base {

		/**
		 * Register Builder Above Customizer Configurations.
		 *
		 * @param Array                $configurations Astra Customizer Configurations.
		 * @param WP_Customize_Manager $wp_customize instance of WP_Customize_Manager.
		 * @since x.x.x
		 * @return Array Astra Customizer Configurations with updated configurations.
		 */
		public function register_configuration( $configurations, $wp_customize ) {

			$_section = 'section-above-header-builder';

			$_configs = array(

				// Section: Above Header.
				array(
					'name'     => $_section,
					'type'     => 'section',
					'title'    => __( 'Above Header', 'astra-builder', 'astra' ),
					'panel'    => 'panel-header-builder-group',
					'priority' => 30,
				),

				/**
				 * Option: Header Builder Tabs
				 */
				array(
					'name'        => ASTRA_THEME_SETTINGS . '[builder-header-above-tabs]',
					'section'     => $_section,
					'type'        => 'control',
					'control'     => 'ast-builder-header-control',
					'priority'    => 0,
					'description' => '',
				),

				// Section: Above Header Height.
				array(
					'name'        => ASTRA_THEME_SETTINGS . '[hba-header-height]',
					'section'     => $_section,
					'transport'   => 'postMessage',
					'default'     => astra_get_option( 'hba-header-height' ),
					'priority'    => 30,
					'title'       => __( 'Height', 'astra-builder', 'astra' ),
					'type'        => 'control',
					'control'     => 'ast-slider',
					'suffix'      => '',
					'input_attrs' => array(
						'min'  => 30,
						'step' => 1,
						'max'  => 600,
					),
					'context'     => array(
						array(
							'setting' => 'ast_selected_tab',
							'value'   => 'general',
						),
					),
				),

				// Section: Above Header Border.
				array(
					'name'        => ASTRA_THEME_SETTINGS . '[hba-header-separator]',
					'section'     => $_section,
					'priority'    => 40,
					'transport'   => 'postMessage',
					'default'     => astra_get_option( 'hba-header-separator' ),
					'title'       => __( 'Bottom Border', 'astra-builder', 'astra' ),
					'type'        => 'control',
					'control'     => 'ast-slider',
					'input_attrs' => array(
						'min'  => 0,
						'step' => 1,
						'max'  => 10,
					),
					'context'     => array(
						array(
							'setting' => 'ast_selected_tab',
							'value'   => 'design',
						),
					),
				),

				// Section: Above Header Border Color.
				array(
					'name'      => ASTRA_THEME_SETTINGS . '[hba-header-bottom-border-color]',
					'transport' => 'postMessage',
					'default'   => astra_get_option( 'hba-header-bottom-border-color' ),
					'type'      => 'control',
					'control'   => 'ast-color',
					'section'   => $_section,
					'required'  => array( ASTRA_THEME_SETTINGS . '[hba-header-separator]', '>=', 1 ),
					'priority'  => 50,
					'title'     => __( 'Bottom Border Color', 'astra-builder', 'astra' ),
					'context'   => array(
						array(
							'setting' => 'ast_selected_tab',
							'value'   => 'design',
						),
					),
				),

				// Section: Above Header Color & Backgroud Heading.
				array(
					'name'     => ASTRA_THEME_SETTINGS . '[hba-header-colors-heading]',
					'section'  => $_section,
					'type'     => 'control',
					'control'  => 'ast-heading',
					'priority' => 60,
					'title'    => __( 'Background Color & Image', 'astra-builder', 'astra' ),
					'settings' => array(),
					'context'  => array(
						array(
							'setting' => 'ast_selected_tab',
							'value'   => 'design',
						),
					),
				),

				// Group Option: Above Header Background styling.
				array(
					'name'      => ASTRA_THEME_SETTINGS . '[hba-header-background-styling]',
					'type'      => 'control',
					'control'   => 'ast-settings-group',
					'title'     => __( 'Background', 'astra-builder', 'astra' ),
					'section'   => $_section,
					'transport' => 'postMessage',
					'priority'  => 70,
					'context'   => array(
						array(
							'setting' => 'ast_selected_tab',
							'value'   => 'design',
						),
					),
				),

				// Option: Above Header Background styling.
				array(
					'name'      => 'hba-header-bg-obj-responsive',
					'parent'    => ASTRA_THEME_SETTINGS . '[hba-header-background-styling]',
					'type'      => 'sub-control',
					'section'   => $_section,
					'control'   => 'ast-responsive-background',
					'transport' => 'postMessage',
					'default'   => astra_get_option( 'hba-header-bg-obj-responsive' ),
					'label'     => __( 'Background', 'astra-builder', 'astra' ),
					'priority'  => 5,
					'context'   => array(
						array(
							'setting' => 'ast_selected_tab',
							'value'   => 'general',
						),
					),
				),
			);

			$_configs = array_merge( $_configs, Astra_Builder_Base_Configuration::prepare_advanced_tab( $_section ) );

			return array_merge( $configurations, $_configs );
		}
	}

	/**
	 * Kicking this off by creating object of this class.
	 */
	new Astra_Customizer_Above_Header_Configs();
}
