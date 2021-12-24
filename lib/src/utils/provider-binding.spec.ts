import { InjectionToken, ModuleWithProviders, NgModule, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { UnboundProvider, bindProvider } from './provider-binding';

describe('bindProvider() function', () => {

    it('can bind unbound type providers', () => {
        TestBed.configureTestingModule({
            imports: [
                ServiceModule.withConfig(TestServiceImpl),
            ],
        });

        const injector: Injector = TestBed.inject(Injector);

        const service = injector.get(TestService);

        expect(service.transform('bar')).toBe('[BAR]');
        expect(injector.get(TestServiceImpl) === service).toBe(true);
    });

    it('can bind unbound value providers', () => {
        TestBed.configureTestingModule({
            imports: [
                ValueModule.withConfig({
                    numberValue: { useValue: 5 },
                    stringValue: { useValue: 'foo' },
                }),
            ],
        });

        const injector: Injector = TestBed.inject(Injector);

        const numberValue = injector.get(NUMBER_VALUE);
        const stringValue = injector.get(STRING_VALUE);

        expect(numberValue).toBe(5);
        expect(stringValue).toBe('foo');
    });

    it('can bind unbound class providers', () => {
        TestBed.configureTestingModule({
            imports: [
                ServiceModule.withConfig({ useClass: TestServiceImpl }),
            ],
        });

        const injector: Injector = TestBed.inject(Injector);

        const service = injector.get(TestService);

        expect(service.transform('bar')).toBe('[BAR]');
    });

    it('can bind unbound existing providers', () => {
        TestBed.configureTestingModule({
            imports: [
                ServiceModule.withConfig({ useExisting: TestServiceImpl }),
                ValueModule.withConfig({
                    numberValue: { useExisting: ALT_NUMBER_VALUE },
                    stringValue: { useExisting: ALT_STRING_VALUE },
                }),
            ],
            providers: [
                TestServiceImpl,
                { provide: ALT_NUMBER_VALUE, useValue: 123 },
                { provide: ALT_STRING_VALUE, useValue: 'test test' },
            ],
        });

        const injector: Injector = TestBed.inject(Injector);

        const service = injector.get(TestService);
        const numberValue = injector.get(NUMBER_VALUE);
        const stringValue = injector.get(STRING_VALUE);

        expect(service.transform('baz')).toBe('[BAZ]');
        expect(numberValue).toBe(123);
        expect(stringValue).toBe('test test');
    });

    it('can bind unbound factory providers', () => {
        function testServiceFactory(prefix: string): TestService {
            return {
                transform(input: string): string { return `${prefix} ${input}`; },
            };
        }

        TestBed.configureTestingModule({
            imports: [
                ServiceModule.withConfig({ useFactory: testServiceFactory, deps: [ STRING_VALUE ] }),
                ValueModule.withConfig({
                    numberValue: { useFactory: () => 999 },
                    stringValue: { useFactory: () => 'Hi' },
                }),
            ],
        });

        const injector: Injector = TestBed.inject(Injector);

        const numberValue = injector.get(NUMBER_VALUE);
        const stringValue = injector.get(STRING_VALUE);
        const service = injector.get(TestService);

        expect(numberValue).toBe(999);
        expect(stringValue).toBe('Hi');
        expect(service.transform('John Doe')).toBe('Hi John Doe');
    });

    it('supports multi providers', () => {
        TestBed.configureTestingModule({
            imports: [
                MultiValueModule.withConfig({ useValue: 42 }),
                MultiValueModule.withConfig({ useValue: 1337 }),
                MultiValueModule.withConfig({ useValue: 5 }),
            ],
        });

        const injector: Injector = TestBed.inject(Injector);

        const numberValues = injector.get<number[]>(NUMBER_VALUE);

        expect(numberValues.length).toBe(3);
        expect(numberValues.includes(42)).toBe(true);
        expect(numberValues.includes(1337)).toBe(true);
        expect(numberValues.includes(5)).toBe(true);
    });

    it('supports optional providers', () => {
        TestBed.configureTestingModule({
            imports: [
                OptionalConfigModule.withConfig({}),
            ],
        });

        const injector: Injector = TestBed.inject(Injector);

        const numberValue = injector.get(NUMBER_VALUE, null!);

        expect(numberValue).toBeNull();
    });

    it('supports default providers', () => {
        TestBed.configureTestingModule({
            imports: [
                OptionalConfigModule.withConfig({}),
            ],
        });

        const injector: Injector = TestBed.inject(Injector);

        const stringValue = injector.get(STRING_VALUE, null!);
        const service1 = injector.get(TestService, null!);
        const service2 = injector.get(TestService2, null!);
        const serviceImpl = injector.get(TestServiceImpl);
        const altService1 = injector.get(ALT_TEST_SERVICE_1, null!);
        const altService2 = injector.get(ALT_TEST_SERVICE_2, null!);

        expect(stringValue).toBe('default-value');
        expect(service1).not.toBeNull();
        expect(service1).toBeDefined();
        expect(service1.transform('hey')).toBe('[HEY]');
        expect(service2).not.toBeNull();
        expect(service2).toBeDefined();
        expect(service2.transform('hey')).toBe('[HEY]');
        expect(serviceImpl).not.toBeNull();
        expect(serviceImpl).toBeDefined();
        expect(service1 === service2).toBe(false);
        expect(service2 === serviceImpl).toBe(true);
        expect(altService1).not.toBeNull();
        expect(altService2).not.toBeNull();
    });

});

const NUMBER_VALUE = new InjectionToken<number>('NUMBER_VALUE');
const STRING_VALUE = new InjectionToken<string>('STRING_VALUE');
const ALT_NUMBER_VALUE = new InjectionToken<number>('ALT_NUMBER_VALUE');
const ALT_STRING_VALUE = new InjectionToken<string>('ALT_STRING_VALUE');

interface ValueModuleOptions {
    numberValue: UnboundProvider<number>;
    stringValue: UnboundProvider<string>;
}

@NgModule()
class ValueModule {
    public static withConfig(options: ValueModuleOptions): ModuleWithProviders<ValueModule> {
        return {
            ngModule: ValueModule,
            providers: [
                bindProvider(NUMBER_VALUE, options.numberValue),
                bindProvider(STRING_VALUE, options.stringValue),
            ],
        };
    }
}

abstract class TestService {
    public abstract transform(input: string): string;
}

abstract class TestService2 extends TestService {
}

class TestServiceImpl extends TestService {
    public transform(input: string): string {
        return `[${input.toUpperCase()}]`;
    }
}

@NgModule()
class ServiceModule {
    public static withConfig(service: UnboundProvider<TestService>): ModuleWithProviders<ServiceModule> {
        return {
            ngModule: ServiceModule,
            providers: [
                bindProvider(TestService, service),
            ],
        };
    }
}

const ALT_TEST_SERVICE_1 = new InjectionToken<TestService>('ALT_TEST_SERVICE_1');
const ALT_TEST_SERVICE_2 = new InjectionToken<TestService>('ALT_TEST_SERVICE_2');

@NgModule()
class OptionalConfigModule {
    public static withConfig(
        options: Partial<ValueModuleOptions> & { service?: UnboundProvider<TestService> },
    ): ModuleWithProviders<OptionalConfigModule> {
        return {
            ngModule: OptionalConfigModule,
            providers: [
                bindProvider(NUMBER_VALUE,       options.numberValue),
                bindProvider(STRING_VALUE,       options.stringValue, { default: { useValue: 'default-value' } }),
                bindProvider(TestService,        options.service,     { default: { useClass: TestServiceImpl } }),
                bindProvider(TestService2,       options.service,     { default: TestServiceImpl }),
                bindProvider(ALT_TEST_SERVICE_1, options.service,     { default: { useExisting: TestService } }),
                bindProvider(ALT_TEST_SERVICE_2, options.service,     { default: { useFactory: () => new TestServiceImpl() } }),
            ],
        };
    }
}

@NgModule()
class MultiValueModule {
    public static withConfig(numberValue: UnboundProvider<number>): ModuleWithProviders<MultiValueModule> {
        return {
            ngModule: ValueModule,
            providers: [
                bindProvider(NUMBER_VALUE, numberValue, { multi: true }),
            ],
        };
    }
}
