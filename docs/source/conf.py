# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information



from sphinx.writers.html import HTMLTranslator

class MyHTMLTranslator(HTMLTranslator):
     def visit_only(self, node):
         pass  # Add custom handling for 'only' node type

     def depart_only(self, node):
         pass  # Add custom handling for 'only' node type

def setup(app):
     app.set_translator('html', MyHTMLTranslator)


project = 'Sage-documentaiton'
copyright = '2025, Andrew, Blake, Cheick'
author = 'Andrew, Blake, Cheick'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = []

templates_path = ['_templates']
exclude_patterns = []



# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = 'alabaster'
html_static_path = ['_static']
