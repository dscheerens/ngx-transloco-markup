import { InjectionToken, Provider, Type } from '@angular/core';

/**
 * Type for classes that can be used as tokens for injection. We might be inclined to use Angular's `Type<T>` interface for this, however,
 * that interface cannot be used for abstract classes, which are also valid tokens. The `InjectableType<T>` supports both abstract and
 * concrete classes and thus is a more accurate definition of a class type which can be used for injection.
 */
export type InjectableType<T> = Function & { prototype: T }; // tslint:disable-line:ban-types

/** Type representing valid typesafe token types for provider binding. */
export type Token<T> = InjectableType<T> | InjectionToken<T>;

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
    useExisting: Token<T>;
}

/** Definition (without token binding) for providers that use a factory function to create injection values. */
export interface UnboundFactoryProvider<T> {
    /**
     * A function to invoke to create a value when this provider is injected for a specific token. The function is invoked with resolved
     * values of tokens in the `deps` field.
     */
    useFactory(...deps: any[]): T;

    /**
     * A list of tokens which need to be resolved by the injector. The list of values is then used as arguments to the `useFactory`
     * function.
     */
    deps?: any[]; // tslint:disable-line:member-ordering
}

/**
 * Typesafe representation for provider definitions which are not bound to a specific token (i.e. a definition wihtout `provide` property).
 */
export type UnboundProvider<T> =
    UnboundTypeProvider<T> |
    UnboundValueProvider<T> |
    UnboundClassProvider<T> |
    UnboundExistingProvider<T> |
    UnboundFactoryProvider<T>;

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
export function bindProvider<T, U extends T>(
    token: Token<T>,
    unboundProvider: UnboundProvider<U> | undefined,
    options: BindProviderOptions<U> = {}
): Provider {
    return (
        unboundProvider ? (
            (unboundProvider as { apply?: unknown }).apply ?
                [
                    unboundProvider,
                    {
                        provide: token,
                        useExisting: unboundProvider as UnboundTypeProvider<U>,
                        multi: options.multi
                    }
                ] :
            (unboundProvider as UnboundValueProvider<U>).useValue ?
                {
                    provide: token,
                    useValue: (unboundProvider as UnboundValueProvider<U>).useValue,
                    multi: options.multi
                } :
            (unboundProvider as UnboundClassProvider<U>).useClass ?
                {
                    provide: token,
                    useClass: (unboundProvider as UnboundClassProvider<U>).useClass,
                    multi: options.multi
                } :
            (unboundProvider as UnboundExistingProvider<U>).useExisting ?
                {
                    provide: token,
                    useExisting: (unboundProvider as UnboundExistingProvider<U>).useExisting,
                    multi: options.multi
                } :
            (unboundProvider as { useFactory?: unknown }).useFactory ?
                {
                    provide: token,
                    useFactory: (unboundProvider as UnboundFactoryProvider<U>).useFactory, // tslint:disable-line:no-unbound-method
                    deps: (unboundProvider as UnboundFactoryProvider<U>).deps,
                    multi: options.multi
                } :
            bindProviderError(`Invalid unbound provider was specified for "${token}"`)
        ) :
        options.default ? (
            (options.default as { apply?: unknown }).apply  ?
                [
                    options.default,
                    {
                        provide: token,
                        useExisting: options.default as UnboundTypeProvider<U>,
                        multi: options.multi
                    }
                ] :
            (options.default as UnboundValueProvider<U>).useValue ?
                {
                    provide: token,
                    useValue: (options.default as UnboundValueProvider<U>).useValue,
                    multi: options.multi
                } :
            (options.default as UnboundClassProvider<U>).useClass ?
                {
                    provide: token,
                    useClass: (options.default as UnboundClassProvider<U>).useClass,
                    multi: options.multi
                } :
            (options.default as UnboundExistingProvider<U>).useExisting ?
                {
                    provide: token,
                    useExisting: (options.default as UnboundExistingProvider<U>).useExisting,
                    multi: options.multi
                } :
            (options.default as { useFactory?: unknown }).useFactory ?
                {
                    provide: token,
                    useFactory: (options.default as UnboundFactoryProvider<U>).useFactory, // tslint:disable-line:no-unbound-method
                    deps: (options.default as UnboundFactoryProvider<U>).deps,
                    multi: options.multi
                } :
            bindProviderError(`Invalid default unbound provider was specified for "${token}"`)
        ) :
        []
    );
}

class BindProviderError extends Error { }

function bindProviderError(message: string): never {
    throw new BindProviderError(message);
}
