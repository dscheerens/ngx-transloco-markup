import { Inject, Optional, Provider, ProviderToken, SkipSelf, Type } from '@angular/core';

/** Definition (without token binding) for providers that will create a singleton instance of the specified class for injection. */
export type UnboundTypeProvider<T> = Type<T>;

/** Definition (without token binding) for providers that use the specified value for injection. */
export interface UnboundValueProvider<T> {
    /** The value to inject. */
    useValue: T;
}

/** Definition (without token binding) for providers that instantiate a specific class for injection. */
export interface UnboundClassProvider<T> {
    /** Class to instantiate when being injected for a specific token. */
    useClass: Type<T>;
}

/** Definition (without token binding) for providers that reference another token to use for injection. */
export interface UnboundExistingProvider<T> {
    /** Existing token to return (equivalent to `injector.get(useExisting)`). */
    useExisting: ProviderToken<T>;
}

/** Definition (without token binding) for providers that use a factory function to create injection values. */
export interface UnboundFactoryProvider<T> {
    /**
     * A function to invoke to create a value when this provider is injected for a specific token. The function is invoked with resolved
     * values of tokens in the `deps` field.
     */
    useFactory: (...deps: any[]) => T; // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/method-signature-style

    /**
     * A list of tokens which need to be resolved by the injector. The list of values is then used as arguments to the `useFactory`
     * function.
     */
    deps?: unknown[];
}

/**
 * Definition (without token binding) for providers that use the value directly for injection.
 *
 * This is the same as wrapping the value in an object with a `useValue` property that contains the value that is to be injected.
 */
 export type UnboundDirectValueProvider<T> = T;

/**
 * Typesafe representation for provider definitions which are not bound to a specific token (i.e. a definition wihtout `provide` property).
 */
export type UnboundProvider<T> =
    | UnboundTypeProvider<T>
    | UnboundValueProvider<T>
    | UnboundClassProvider<T>
    | UnboundExistingProvider<T>
    | UnboundFactoryProvider<T>
    | UnboundDirectValueProvider<T>;

/** Converts the parameters of a function into a tuple of tokens that resolve to the type of the parameters. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InjectionDependencies<T extends (...args: any) => any> = T extends (...args: infer P) => any
    ? { [K in keyof P]: ProviderToken<P[K]> | [...(Optional | SkipSelf)[], ProviderToken<P[K]> | Inject] }
    : never;

/**
 * Creates an `UnboundValueProvider` for the specified value.
 *
 * @param value The value to inject.
 */
export function useValue<T>(value: T): UnboundValueProvider<T> {
    return { useValue: value };
}

/**
 * Creates an `UnboundClassProvider` for the specified class.
 *
 * @param providerClass Class to instantiate when being injected for a specific token.
 */
export function useClass<T>(providerClass: Type<T>): UnboundClassProvider<T> {
    return { useClass: providerClass };
}

/**
 * Creates an `UnboundExistingProvider` for the specified `ProviderToken`.
 *
 * @param providerToken Existing token to return (equivalent to `injector.get(useExisting)`).
 */
export function useExisting<T>(providerToken: ProviderToken<T>): UnboundExistingProvider<T> {
    return { useExisting: providerToken };
}

/**
 * Creates an `UnboundFactoryProvider` based on the return type of the specified factory function.
 *
 * The usage of the `useFactory` function is preferred over manually creating an `UnboundFactoryProvider` object literal, because this
 * function will enforce type safe constraints on the dependencies (parameters of the factory function).
 *
 * @param factoryFunction A function to invoke to create a value for this `token`. The function is invoked with resolved values of the
 *                        specified dependencies (`ProviderToken`s)
 * @param dependencies    List of `token`s to be resolved by the injector. These values are then used as arguments for the factory function.
 */
export function useFactory<F extends (...args: any) => any>( // eslint-disable-line @typescript-eslint/no-explicit-any
    factoryFunction: F,
    ...dependencies: InjectionDependencies<F>
): UnboundFactoryProvider<ReturnType<F>> {
    return {
        useFactory: factoryFunction,
        deps: dependencies,
    };
}

/** Extra binding options for the `bindProvider` function. */
export interface BindProviderOptions<U> {
    /** Whether the provider should be contribute to a "multi-provider" (resulting an array of instances when injected). */
    multi?: boolean;

    /** Default provider definition to use when the provider definition passed to the `bindProvider` function is `undefined`. */
    default?: UnboundProvider<U>;
}

/**
 * Binds the given provider definition to the specified token and returns a `Provider` entry that can be used in the providers list of
 * Angular module definitions.
 *
 * @param token           Token which for which the provider is to be defined.
 * @param unboundProvider Definition of a provider which should be bound to the specified token.
 * @param options         Optional extra binding options.
 */
// eslint-disable-next-line complexity
export function bindProvider<T, U extends T>(
    token: ProviderToken<T>,
    unboundProvider: UnboundProvider<U> | undefined,
    options: BindProviderOptions<U> = {},
): Provider {
    return (
        unboundProvider ? (
            (typeof unboundProvider === 'function') ?
                [
                    unboundProvider,
                    {
                        provide: token,
                        useExisting: unboundProvider,
                        multi: options.multi,
                    },
                ] :
            (typeof unboundProvider === 'object' && 'useValue' in unboundProvider) ?
                {
                    provide: token,
                    useValue: unboundProvider.useValue,
                    multi: options.multi,
                } :
            (typeof unboundProvider === 'object' && 'useClass' in unboundProvider) ?
                {
                    provide: token,
                    useClass: unboundProvider.useClass,
                    multi: options.multi,
                } :
            (typeof unboundProvider === 'object' && 'useExisting' in unboundProvider) ?
                {
                    provide: token,
                    useExisting: unboundProvider.useExisting,
                    multi: options.multi,
                } :
            (typeof unboundProvider === 'object' && 'useFactory' in unboundProvider) ?
                {
                    provide: token,
                    useFactory: unboundProvider.useFactory,
                    deps: unboundProvider.deps,
                    multi: options.multi,
                } :
                {
                    provide: token,
                    useFactory: () => unboundProvider as T,
                    multi: options.multi,
                }
        ) :
        options.default ? (
            (typeof options.default === 'function') ?
                [
                    options.default,
                    {
                        provide: token,
                        useExisting: options.default,
                        multi: options.multi,
                    },
                ] :
            (typeof options.default === 'object' && 'useValue' in options.default) ?
                {
                    provide: token,
                    useValue: options.default.useValue,
                    multi: options.multi,
                } :
            (typeof options.default === 'object' && 'useClass' in options.default) ?
                {
                    provide: token,
                    useClass: options.default.useClass,
                    multi: options.multi,
                } :
            (typeof options.default === 'object' && 'useExisting' in options.default) ?
                {
                    provide: token,
                    useExisting: options.default.useExisting,
                    multi: options.multi,
                } :
            (typeof options.default === 'object' && 'useFactory' in options.default) ?
                {
                    provide: token,
                    useFactory: options.default.useFactory,
                    deps: options.default.deps,
                    multi: options.multi,
                } :
                {
                    provide: token,
                    useFactory: () => options.default as T,
                    multi: options.multi,
                }
        ) :
        []
    );
}
