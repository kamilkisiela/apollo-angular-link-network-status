import { Injectable, NgModule } from '@angular/core';
import {
  ApolloLink,
  Operation,
  FetchResult,
  Observable as LinkObservable,
} from '@apollo/client/core';
import {
  BehaviorSubject,
  Subject,
  asyncScheduler,
  pipe,
  MonoTypeOperatorFunction,
} from 'rxjs';
import { observeOn, distinctUntilChanged, share } from 'rxjs/operators';

export function event<T>(): MonoTypeOperatorFunction<T> {
  return pipe(
    share(),
    observeOn(asyncScheduler),
  );
}

interface WithOperation {
  operation: Operation;
}

interface OnRequest extends WithOperation {}

interface OnSuccess extends WithOperation {
  result: FetchResult;
}

interface OnError extends WithOperation {
  error: any;
}

interface OnCancel extends WithOperation {}

@Injectable()
export class ApolloNetworkStatus extends ApolloLink {
  private count = 0;
  private pending$ = new BehaviorSubject<boolean>(false);
  private request$ = new Subject<OnRequest>();
  private success$ = new Subject<OnSuccess>();
  private error$ = new Subject<OnError>();
  private cancel$ = new Subject<OnCancel>();

  public isPending = this.pending$.asObservable().pipe(
    event(),
    distinctUntilChanged(),
  );
  public onRequest = this.request$.asObservable().pipe(event());
  public onSuccess = this.success$.asObservable().pipe(event());
  public onError = this.error$.asObservable().pipe(event());
  public onCancel = this.cancel$.asObservable().pipe(event());

  constructor() {
    super();
  }

  request(operation, forward) {
    this._onRequest({ operation });
    const subscriber = forward(operation);

    return new LinkObservable(observer => {
      let isPending = true;

      const subscription = subscriber.subscribe({
        next: result => {
          isPending = false;
          this._onSuccess({ operation, result });
          observer.next(result);
        },
        error: error => {
          isPending = false;
          this._onError({ operation, error });
          observer.error(error);
        },
        complete: () => {
          observer.complete();
        },
      });

      return () => {
        if (isPending) this._onCancel({ operation });
        if (subscription) subscription.unsubscribe();
      };
    });
  }

  _onRequest(data: OnRequest) {
    this.request$.next(data);
    this.increase();
  }
  _onSuccess(data: OnSuccess) {
    this.success$.next(data);
    this.decrease();
  }
  _onError(data: OnError) {
    this.error$.next(data);
    this.decrease();
  }
  _onCancel(data: OnCancel) {
    this.cancel$.next(data);
    this.decrease();
  }

  increase() {
    this.count++;
    this.update();
  }

  decrease() {
    this.count--;
    this.update();
  }

  update() {
    this.pending$.next(this.count > 0);
  }
}

@NgModule({
  providers: [ApolloNetworkStatus],
})
export class ApolloNetworkStatusModule {}
