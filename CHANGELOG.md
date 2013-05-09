# Changelog

### 0.4.2 - 2013-05-09
- Change from `component.json` to `bower.json`.

###0.4.1 - 2013-04-09
- Fix `instanceOf` throwing an exception when passing non-constructors.

### 0.4.0 - 2013-03-12
- Move `optimizer` to its own [repository](https://github.com/IndigoUnited/dejavu-optimizer)

### 0.3.9 - 2013-03-10
- Add minified version of the `regular loose` mode.
- Fix some error message typos.

### 0.3.8 - 2013-03-09
- Fix `console.inspect` not handling circular references on arrays/objects

### 0.3.7 - 2013-03-07
- Fix `.dejavurc` strict value not being correctly interpreted in some edge cases (only affects `node` users)
- Fix an important bug when a class extends another one of a different `node` package in `strict` mode (only affects `node` users)
- Refactor tests and make them run in all environments

### 0.3.6 - 2013-03-06
- Remove micro-optimization in non-optimized classes in loose version (it was giving some problems)

### 0.3.5 - 2013-03-05
- Add `grunt` task for the optimizer
- Small improvements to the optimizer

###0.3.4 - 2013-03-04
- Fix optimizer error when using `this.$super.apply` or `.call`

###0.3.3 - 2013-02-18
- Fix `postinstall` script in some rare cases

### 0.3.2 - 2013-02-15
- Fix rare bug in when using `$bind` with `null` values

### 0.3.1 - 2013-02-02
- Fix bug in the optimizer, not guessing when to use the non-closure when correctly
- Other minor optimizer tweaks

### 0.3.0 - 2013-02-02
- __Add $member() to allow common usage of `var that = this` and still access protected/private members__
- Fix dejavu being unlocked by default in `node`
- Loose mode now keeps `$name`
- Other minor tweaks and improved documentation

### 0.2.2 - 2013-01-22
- Fix one more issue with the optimizer task in windows

### 0.2.1 - 2013-01-19
- Fix optimizer automaton task in windows