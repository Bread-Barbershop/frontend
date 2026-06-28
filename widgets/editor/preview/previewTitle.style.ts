import { cva } from 'class-variance-authority';

export const previewTitleVariants = cva('', {
  variants: {
    variant: {
      wedding: 'text-text-wedding',
      firstBirthday: 'text-text-firstbirthday',
      birthday: 'text-text-birthday',
      seminar: 'text-text-seminar',
      etc: 'text-black',
    },
  },
  defaultVariants: {
    variant: 'wedding',
  },
});
