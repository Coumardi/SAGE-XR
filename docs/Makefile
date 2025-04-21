# Minimal makefile for Sphinx documentation
#

# You can set these variables from the command line, and also
# from the environment for the first two.
SPHINXOPTS    ?=
SPHINXBUILD   ?= sphinx-build
SOURCEDIR     = source
BUILDDIR      = build

# Put it first so that "make" without argument is like "make help".
help:
@$(SPHINXBUILD) -M help "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)

.PHONY: help Makefile

# Catch-all target: route all unknown targets to Sphinx using the new
# "make mode" option.  $(O) is meant as a shortcut for $(SPHINXOPTS).
%: Makefile
@$(SPHINXBUILD) -M $@ "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)

# Targets for specific documents
intro:
@$(SPHINXBUILD) -b html "$(SOURCEDIR)" "$(BUILDDIR)/sdd" -t intro $(SPHINXOPTS)

sdd:
@$(SPHINXBUILD) -b html "$(SOURCEDIR)" "$(BUILDDIR)/sdd" -t sdd $(SPHINXOPTS)

srs:
@$(SPHINXBUILD) -b html "$(SOURCEDIR)" "$(BUILDDIR)/srs" -t srs $(SPHINXOPTS)

std:
@$(SPHINXBUILD) -b html "$(SOURCEDIR)" "$(BUILDDIR)/std" -t std $(SPHINXOPTS)
