# Network Status Link for Angular

Information about the network status of your GraphQL operations. Built for Apollo Angular.

## Installation

    yarn add apollo-angular-link-network-status
    # or
    npm install apollo-angular-link-network-status

## Example

 - [working example on StackBlitz.io](https://stackblitz.com/edit/apollo-angular-network-status?file=app%2Fgraphql.module.ts)

Setup the module:

```typescript
import { ApolloNetworkStatusModule } from 'apollo-angular-link-network-status';

@NgModule({
  imports: [
    //...
    ApolloNetworkStatusModule
  ]
})
export class AppModule {}
```

Use the link:

```typescript
import { ApolloNetworkStatus } from 'apollo-angular-link-network-status';

@NgModule({
  // ...
  providers: [{
    provide: APOLLO_OPTIONS,
    useFactory(networkStatus: ApolloNetworkStatus, httpLink: HttpLink) {
      return {
        link: networkStatus.concat( // <-- as a regular Apollo Link
          httpLink.create({ uri })
        ),
        cache: new InMemoryCache()
      }
    },
    deps: [ApolloNetworkStatus, HttpLink]
  }]
})
export class AppModule {}
```

Usage inside of a component or a service:

```typescript
import { Component } from '@angular/core';
import { ApolloNetworkStatus } from 'apollo-angular-link-network-status';

@Component({
  selector: 'app',
  template: `
    <app-list></app-list>
    <div *ngIf="(networkStatus.isPending | async)">Loading</div>
  `,
})
export class AppComponent {
  constructor(public networkStatus: ApolloNetworkStatus) {
    networkStatus.isPending.subscribe(isPending => {
      console.log('isPending', isPending);
    });

    networkStatus.onRequest.subscribe(event => {
      console.log('request', event);
    });

    networkStatus.onSuccess.subscribe(event => {
      console.log('success', event);
    });

    networkStatus.onError.subscribe(event => {
      console.log('error', event);
    });

    networkStatus.onCancel.subscribe(event => {
      console.log('cancel', event);
    });
  }
}
```
