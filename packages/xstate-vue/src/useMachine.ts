import { Ref, shallowRef } from 'vue';
import {
  AnyStateMachine,
  AreAllImplementationsAssumedToBeProvided,
  InternalMachineImplementations,
  InterpreterFrom,
  InterpreterOptions,
  StateFrom
} from 'xstate';
import { MaybeLazy, Prop } from './types.ts';
import { useInterpret } from './useInterpret.ts';

type RestParams<TMachine extends AnyStateMachine> =
  AreAllImplementationsAssumedToBeProvided<
    TMachine['__TResolvedTypesMeta']
  > extends false
    ? [
        options: InterpreterOptions<TMachine> &
          InternalMachineImplementations<
            TMachine['__TContext'],
            TMachine['__TEvent'],
            TMachine['__TResolvedTypesMeta'],
            true
          >
      ]
    : [
        options?: InterpreterOptions<TMachine> &
          InternalMachineImplementations<
            TMachine['__TContext'],
            TMachine['__TEvent'],
            TMachine['__TResolvedTypesMeta']
          >
      ];

type UseMachineReturn<
  TMachine extends AnyStateMachine,
  TInterpreter = InterpreterFrom<TMachine>
> = {
  state: Ref<StateFrom<TMachine>>;
  send: Prop<TInterpreter, 'send'>;
  service: TInterpreter;
};

export function useMachine<TMachine extends AnyStateMachine>(
  getMachine: MaybeLazy<TMachine>,
  ...[options = {}]: RestParams<TMachine>
): UseMachineReturn<TMachine> {
  function listener(nextSnapshot: StateFrom<TMachine>) {
    if (nextSnapshot !== snapshot) {
      snapshot = nextSnapshot;
      state.value = snapshot;
    }
  }

  const service = useInterpret(getMachine, options, listener);

  let snapshot = service.getSnapshot();
  const state = shallowRef(snapshot);

  return { state, send: service.send, service } as any;
}
