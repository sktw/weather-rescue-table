import {expect} from 'chai';
import rootReducer from '../src/reducers';
import * as Actions from '../src/actions';
import manifests from './manifests';
import {ImmutableChecker} from './testUtils';

function valueState() {
    return {
        value: '',
        edited: false,
        unclear: false,
        fullErrors: []
    };
}

function resultsState() {
    return {
        value: '',
        copied: false,
        hasCopyError: false
    };
}

function chainActions(actions, initialState = rootReducer(undefined, {})) {
    return actions.reduce((state, action) => rootReducer(state, action), initialState);
}

function selectManifest(manifest) {
    return Actions.selectSubject(manifest.year, manifest.locationsTitle, manifest.columnsTitle);
}

const checker = new ImmutableChecker();

describe('rootReducer', () => {
    it('should return initial state', () => {
        expect(rootReducer(undefined, {})).to.deep.equal({
            selector: {
                year: '',
                locations: '',
                columns: '',
                yearChoices: [],
                locationsChoices: [],
                columnsChoices: []
            },
            manifests: [],
            manifest: null,
            table: null,
            results: null,
            current: {
                value: '',
                edited: false,
                unclear: false,
                fullErrors: [],
                partialErrors: [],
                col: -1,
                row: -1
            }
        });
    });

    it('should load manifests', () => {
        let state = chainActions([]);
        checker.setState(state);

        state = rootReducer(state, Actions.loadManifests(manifests));

        expect(state).to.deep.include({
            manifests,
            selector: {
                year: '',
                locations: '',
                columns: '',
                yearChoices: ['2016', '2018'],
                locationsChoices: [],
                columnsChoices: []
            }
        });

        expect(checker.check()).to.be.true;
    });

    it('should select blank subject', () => {
        let state = chainActions([Actions.loadManifests(manifests)]);
        checker.setState(state);

        expect(rootReducer(state, Actions.selectSubject('', '', ''))).to.deep.include({
            manifest: null
        });

        expect(checker.check()).to.be.true;
    });

    it('should select year and populate locationsChoices', () => {
        let state = chainActions([Actions.loadManifests(manifests)]);
        checker.setState(state);

        expect(rootReducer(state, Actions.selectSubject('2018', '', ''))).to.deep.include({
            manifest: null,
            selector: {
                year: '2018',
                locations: '',
                columns: '',
                yearChoices: ['2016', '2018'],
                locationsChoices: ['Southampton - Brighton', 'Ventnor - Cowes'],
                columnsChoices: []
            }

        });

        expect(checker.check()).to.be.true;
    });

    it('should select locations and populate columnsChoices', () => {
        let state = chainActions([Actions.loadManifests(manifests)]);
        checker.setState(state);

        expect(rootReducer(state, Actions.selectSubject('2018', 'Southampton - Brighton', ''))).to.deep.include({
            manifest: null,
            selector: {
                year: '2018',
                locations: 'Southampton - Brighton',
                columns: '',
                yearChoices: ['2016', '2018'],
                locationsChoices: ['Southampton - Brighton', 'Ventnor - Cowes'],
                columnsChoices: ['Pressure Temp. Rainfall']
            }

        });

        expect(checker.check()).to.be.true;
    });

    it('should select subject', () => {
        const table = {
            1: [valueState(), valueState(), valueState(), valueState()],
            3: [valueState(), valueState(), valueState(), valueState()],
            4: [valueState(), valueState(), valueState(), valueState()],
        };

        const results = {
            1: resultsState(),
            3: resultsState(),
            4: resultsState()
        };

        const current = {
            value: '',
            edited: false,
            unclear: false,
            fullErrors: [],
            partialErrors: [],
            col: -1,
            row: -1
        };

        let state = chainActions([Actions.loadManifests(manifests)]);

        checker.setState(state);
        const manifest = manifests[1];
        state = rootReducer(state, selectManifest(manifest));

        expect(state).to.deep.equal({
            selector: {
                year: '2018',
                locations: 'Southampton - Brighton',
                columns: 'Pressure Temp. Rainfall',
                yearChoices: ['2016', '2018'],
                locationsChoices: ['Southampton - Brighton', 'Ventnor - Cowes'],
                columnsChoices: ['Pressure Temp. Rainfall']
            },
            manifest,
            manifests,
            table,
            results,
            current
        });

        expect(checker.check()).to.be.true;
    });

    it('should switch between subjects', () => {
        const table = {
            1: [valueState(), valueState()],
            2: [valueState(), valueState()],
        };

        const results = {
            1: resultsState(),
            2: resultsState(),
        };

        const current = {
            value: '',
            edited: false,
            unclear: false,
            fullErrors: [],
            partialErrors: [],
            col: -1,
            row: -1
        };

        let state = chainActions([
            Actions.loadManifests(manifests),
            selectManifest(manifests[1])
        ]);

        checker.setState(state);
        const manifest = manifests[0];
        state = rootReducer(state, selectManifest(manifest));

        expect(state).to.deep.equal({
            selector: {
                year: '2016',
                locations: 'Ventnor - Cowes',
                columns: 'Max Min',
                yearChoices: ['2016', '2018'],
                locationsChoices: ['Ventnor - Cowes'],
                columnsChoices: ['Max Min']
            },
            manifest,
            manifests,
            table,
            results,
            current
        });

        expect(checker.check()).to.be.true;
    });

    it('should set current in beginUpdateValue with previously unedited value', () => {
        let state = chainActions([
            Actions.loadManifests(manifests),
            selectManifest(manifests[1])
        ]);

        checker.setState(state);
        state = rootReducer(state, Actions.beginUpdateValue(1, 0));

        expect(state.current).to.deep.equal({
            value: '',
            edited: false,
            unclear: false,
            fullErrors: [],
            partialErrors: [],
            col: 1,
            row: 0
        });

        expect(checker.check()).to.be.true;
    });

    it('should set current in beginUpdateValue with previously edited value', () => {
        let state = chainActions([
            Actions.loadManifests(manifests),
            selectManifest(manifests[1])
        ]);

        state.table[1][0] = {
            value: '30.3',
            edited: true,
            unclear: true, 
            fullErrors: ['Value does not match pattern']
        };

        checker.setState(state);
        state = rootReducer(state, Actions.beginUpdateValue(1, 0));

        expect(state.current).to.deep.equal({
            value: '30.3',
            edited: true,
            unclear: true,
            fullErrors: ['Value does not match pattern'],
            partialErrors: ['Value does not match pattern'],
            col: 1,
            row: 0
        });

        expect(checker.check()).to.be.true;
    });

    it('should update current in updateValue', () => {
        let state = chainActions([
            Actions.loadManifests(manifests),
            selectManifest(manifests[1]),
            Actions.beginUpdateValue(1, 0)
        ]);

        checker.setState(state);
        state = rootReducer(state, Actions.updateValue('30.3', [], ['Value does not match pattern'], false));

        expect(state.current).to.deep.equal({
            value: '30.3',
            edited: true,
            unclear: false,
            fullErrors: ['Value does not match pattern'],
            partialErrors: [],
            col: 1,
            row: 0
        });

        expect(checker.check()).to.be.true;
    });

    it('should update table, current in endUpdateValue', () => {
        let state = chainActions([
            Actions.loadManifests(manifests),
            selectManifest(manifests[1]),
            Actions.beginUpdateValue(1, 0),
            Actions.updateValue('3', [], ['Value does not match pattern'], false)
        ]);

        checker.setState(state);
        state = rootReducer(state, Actions.endUpdateValue());

        expect(state.table).to.deep.include({
            1: [{
                    value: '3', 
                    unclear: false, 
                    edited: true, 
                    fullErrors: ['Value does not match pattern']
                },
                valueState(),
                valueState(),
                valueState()
            ]
        });

        expect(state.results).to.deep.equal({
            1: resultsState(),
            3: resultsState(),
            4: resultsState()
        });

        expect(state.current).to.deep.equal({
            value: '',
            edited: false,
            unclear: false,
            fullErrors: [],
            partialErrors: [],
            col: -1,
            row: -1
        });

        expect(checker.check()).to.be.true;
    });

    it('should update results in endUpdateValue if all values valid', () => {
        let state = chainActions([
            Actions.loadManifests(manifests),
            selectManifest(manifests[1])
        ]);

        state.table[1][0] = {
            value: '30.24',
            edited: true, 
            unclear: false,
            fullErrors: []
        };

        state.table[1][1] = {
            value: '29',
            edited: true,
            unclear: true,
            fullErrors: ['Value does not match pattern']
        };

        state.table[1][2] = {
            value: '31.45',
            edited: true,
            unclear: false,
            fullErrors: []
        };


        state = chainActions([
            Actions.beginUpdateValue(1, 3),
            Actions.updateValue('31.22', [], [], false)
        ], state);
 
        checker.setState(state);
        state = rootReducer(state, Actions.endUpdateValue());

        expect(state.results).to.deep.equal({
            1: {
                value: '30.24,[unclear]29[/unclear],31.45,31.22',
                copied: false,
                hasCopyError: false
            },
            3: resultsState(),
            4: resultsState()
        });

        expect(checker.check()).to.be.true;
    });

    it('should update copied if values change', () => {
        let state = chainActions([
            Actions.loadManifests(manifests),
            selectManifest(manifests[1])
        ]);

        state.table[1][0] = {
            value: '30.24',
            edited: true, 
            unclear: false,
            fullErrors: []
        };

        state.table[1][1] = {
            value: '29',
            edited: true,
            unclear: true,
            fullErrors: ['Value does not match pattern']
        };

        state.table[1][2] = {
            value: '31.45',
            edited: true,
            unclear: false,
            fullErrors: []
        };

        state.table[1][3] = {
            value: '31.22',
            edited: true,
            unclear: false,
            fullErrors: []
        };

        state.results[1] = {
            value: '30.24,[unclear]29[/unclear],31.45,31.22',
            copied: true,
            hasCopyError: false
        }

        state = chainActions([
            Actions.beginUpdateValue(1, 3),
            Actions.updateValue('29.25', [], [], false),
            Actions.endUpdateValue()
        ], state);
 
        expect(state.results).to.deep.equal({
            1: {
                value: '30.24,[unclear]29[/unclear],31.45,29.25',
                copied: false,
                hasCopyError: false
            },
            3: resultsState(),
            4: resultsState()
        });
    });

    it('should not update copied if values have not changed', () => {
        let state = chainActions([
            Actions.loadManifests(manifests),
            selectManifest(manifests[1])
        ]);

        state.table[1][0] = {
            value: '30.24',
            edited: true, 
            unclear: false,
            fullErrors: []
        };

        state.table[1][1] = {
            value: '29',
            edited: true,
            unclear: true,
            fullErrors: ['Value does not match pattern']
        };

        state.table[1][2] = {
            value: '31.45',
            edited: true,
            unclear: false,
            fullErrors: []
        };

        state.table[1][3] = {
            value: '31.22',
            edited: true,
            unclear: false,
            fullErrors: []
        };

        state.results[1] = {
            value: '30.24,[unclear]29[/unclear],31.45,31.22',
            copied: true,
            hasCopyError: false
        }

        state = chainActions([
            Actions.beginUpdateValue(1, 3),
            Actions.updateValue('31.22', [], [], false),
            Actions.endUpdateValue()
        ], state);
 
        expect(state.results).to.deep.equal({
            1: {
                value: '30.24,[unclear]29[/unclear],31.45,31.22',
                copied: true,
                hasCopyError: false
            },
            3: resultsState(),
            4: resultsState()
        });
    });

    it('should toggle unclear if currently updating', () => {
        let state = chainActions([
            Actions.loadManifests(manifests),
            selectManifest(manifests[1]),
            Actions.beginUpdateValue(3, 2)
        ]);

        checker.setState(state);
        state = rootReducer(state, Actions.toggleUnclear());

        expect(state.current.unclear).to.be.true;

        state = rootReducer(state, Actions.toggleUnclear());

        expect(state.current.unclear).to.be.false;

        expect(checker.check()).to.be.true;
    });

    it('should ignore toggle unclear if not currently updating', () => {
        let state = chainActions([
            Actions.loadManifests(manifests),
            selectManifest(manifests[1])
        ]);

        const nextState = rootReducer(state, Actions.toggleUnclear());
        expect(nextState).to.equal(state);
    });

    it('should set copied', () => {
        let state = chainActions([
            Actions.loadManifests(manifests),
            selectManifest(manifests[1])
        ]);

        checker.setState(state);
        state = rootReducer(state, Actions.copy(1));

        expect(state.results[1].copied).to.be.true;
        expect(state.results[1].hasCopyError).to.be.false;

        expect(checker.check()).to.be.true;
    });

    it('should set copy error', () => {
        let state = chainActions([
            Actions.loadManifests(manifests),
            selectManifest(manifests[1])
        ]);

        checker.setState(state);
        state = rootReducer(state, Actions.copyError(1));

        expect(state.results[1].copied).to.be.false;
        expect(state.results[1].hasCopyError).to.be.true;

        expect(checker.check()).to.be.true;
    });

    it('should reset state on done', () => {
        let state = chainActions([
            Actions.loadManifests(manifests),
            selectManifest(manifests[1])
        ]);

        state.table[1][0] = {
            value: '30.24',
            edited: true, 
            unclear: false,
            fullErrors: []
        };

        state.table[1][1] = {
            value: '29',
            edited: true,
            unclear: true,
            fullErrors: ['Value does not match pattern']
        };

        state.table[1][2] = {
            value: '31.45',
            edited: true,
            unclear: false,
            fullErrors: []
        };

        checker.setState(state);
        state = rootReducer(state, Actions.done());

        expect(state.table).to.deep.equal({
            1: [valueState(), valueState(), valueState(), valueState()],
            3: [valueState(), valueState(), valueState(), valueState()],
            4: [valueState(), valueState(), valueState(), valueState()],
        });

        expect(state.results).to.deep.equal({
            1: resultsState(),
            3: resultsState(),
            4: resultsState()
        });

        expect(state.current).to.deep.equal({
            value: '',
            edited: false,
            unclear: false,
            fullErrors: [],
            partialErrors: [],
            col: -1,
            row: -1
        });

        expect(checker.check()).to.be.true;
    });
});
