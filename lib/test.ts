import 'zone.js';
import 'zone.js/testing';

import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

declare const require: { // eslint-disable-line @typescript-eslint/naming-convention
    context(path: string, deep?: boolean, filter?: RegExp): {
        keys(): string[];
        <T>(id: string): T;
    };
};

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting(),
    {
        teardown: { destroyAfterEach: false },
    },
);

// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/); // eslint-disable-line @typescript-eslint/naming-convention
// And load the modules.
context.keys().map(context);
