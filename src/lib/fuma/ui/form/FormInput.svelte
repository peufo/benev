<script lang="ts" generics="InputType extends FormInputsType">
	import {
		formInputs,
		type FormInputProps,
		type FormInputsType,
	} from '$lib/fuma/ui/form/formInput.js'

	type $$Props = FormInputProps<InputType> & {
		type: InputType
		value: FormInputProps<InputType>['value']
	}

	
	interface Props {
		type: InputType;
		value: FormInputProps<InputType>['value'];
		[key: string]: any
	}

	let { type: inputType, value = $bindable(), ...rest }: Props = $props();
	let component = $derived(formInputs[inputType] as any)

	const SvelteComponent = $derived(component);
</script>

<SvelteComponent bind:value {...rest} />
