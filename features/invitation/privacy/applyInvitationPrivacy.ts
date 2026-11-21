import type {
  GuestBlock,
  GuestPayload,
} from '@/app/guest/[id]/types/guestTypes';
import { formatPhoneNumber } from '@/shared/utils/phoneNumber';

import { createBirthdateRedactor } from './redactLabeledBirthdates';
import {
  getActivePrivacyFields,
  hideCustomShareText,
  type InvitationPrivacyField,
} from './settings';

type Fields = ReadonlySet<InvitationPrivacyField>;
type Data = Record<string, unknown>;

const locationBlocks = new Set(['place', 'afterParty', 'transportation']);
const photoBlocks = new Set(['gallery', 'picture', 'photoStory', 'sponsorshipInfomation']);
const profileBlocks = new Set([
  'coupleIntroduction',
  'myChild',
  'myFamily',
  'organizerInformation',
  'speakerInformation',
]);

function record(value: unknown): Data {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Data)
    : {};
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function string(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function maskName(value: unknown) {
  const characters = Array.from(string(value).trim());
  return characters.length > 1
    ? characters[0] + '○'.repeat(characters.length - 1)
    : characters.length
      ? '○'
      : '';
}

function maskPhone(value: unknown) {
  const original = string(value);
  const formatted = formatPhoneNumber(original);
  const separator = formatted.indexOf('-');
  if (separator < 0 || original.trim().startsWith('+'))
    return original.replace(/[^\s-]/gu, '*');
  // Keep an area or mobile prefix only, never an unrecognized partial number.
  const prefix = formatted.slice(0, separator);
  const masked = formatted.slice(separator).replace(/[0-9]/g, '*');
  return /^(02|0[1-9][0-9])$/.test(prefix)
    ? prefix + masked
    : (prefix + masked).replace(/[0-9]/g, '*');
}

function maskAccountText(value: unknown) {
  return string(value).replace(/[^\s-]/gu, '*');
}

function redactPhones(props: Data, fields: Fields) {
  return {
    ...props,
    groups: list(props.groups).map(value => {
      const group = record(value);
      return {
        ...group,
        name: fields.has('name') ? maskName(group.name) : group.name,
        contacts: list(group.contacts).map(contactValue => {
          const contact = record(contactValue);
          return {
            ...contact,
            label: fields.has('name') ? maskName(contact.label) : contact.label,
            number: fields.has('phone')
              ? maskPhone(contact.number)
              : contact.number,
          };
        }),
      };
    }),
  };
}

function redactAccounts(props: Data, fields: Fields) {
  return {
    ...props,
    groupList: list(props.groupList).map(value => {
      const group = record(value);
      return fields.has('name')
        ? { ...group, name: maskName(group.name) }
        : group;
    }),
    accountList: list(props.accountList).map(group =>
      list(group).map(value => {
        const entry = record(value);
        return {
          ...entry,
          ...(fields.has('name') ? { name: maskName(entry.name) } : {}),
          ...(fields.has('account')
            ? {
                bank: maskAccountText(entry.bank),
                account: maskAccountText(entry.account),
                kakao: false,
                kakaoPayUrl: undefined,
                tossUrl: undefined,
              }
            : {}),
        };
      })
    ),
  };
}

function redactProfile(props: Data, component: string, fields: Fields) {
  const hideNames = fields.has('name');
  const hideImages = fields.has('media');
  switch (component) {
    case 'coupleIntroduction':
      return {
        ...props,
        ...(hideNames
          ? { groom: maskName(props.groom), bride: maskName(props.bride) }
          : {}),
        ...(hideImages
          ? {
              groomImage: { id: '', image: [] },
              brideImage: { id: '', image: [] },
            }
          : {}),
      };
    case 'myChild':
      return {
        ...props,
        ...(hideNames
          ? { name: maskName(props.name), nickname: maskName(props.nickname) }
          : {}),
        ...(hideImages ? { image: [] } : {}),
      };
    case 'organizerInformation':
      return { ...props, ...(hideImages ? { image: [] } : {}) };
    default: {
      const groups =
        component === 'speakerInformation'
          ? ['speakers']
          : component === 'myFamilyWedding'
            ? ['groomFamily', 'brideFamily']
            : ['family'];
      return {
        ...props,
        ...Object.fromEntries(
          groups.map(key => [
            key,
            list(props[key]).map(value => {
              const member = record(value);
              return {
                ...member,
                ...(hideNames ? { name: maskName(member.name) } : {}),
                ...(hideImages ? { image: [] } : {}),
              };
            }),
          ])
        ),
      };
    }
  }
}

function hasProfileImages(props: Data) {
  return [
    props.image,
    record(props.groomImage).image,
    record(props.brideImage).image,
    ...list(props.family).map(member => record(member).image),
    ...list(props.speakers).map(member => record(member).image),
  ].some(images => list(images).some(Boolean));
}

function redactBlock(block: GuestBlock, fields: Fields): GuestBlock {
  const { component } = block;
  const props = record(block.props);
  if (fields.has('location') && locationBlocks.has(component))
    return { ...block, props: {}, privacyPlaceholder: 'location' };
  if (
    component === 'sponsorshipInfomation' &&
    (fields.has('media') || fields.has('name'))
  ) {
    const sponsors = list(props.sponsors).map(record);
    if (sponsors.some(sponsor => string(sponsor.name).trim())) {
      const hideMedia = fields.has('media');
      return {
        ...block,
        props: {
          ...props,
          ...(hideMedia ? { images: [] } : {}),
          sponsors: sponsors.map(sponsor => ({
            ...sponsor,
            ...(fields.has('name') ? { name: maskName(sponsor.name) } : {}),
            ...(hideMedia ? { logoIndex: null } : {}),
          })),
        },
        privacyMediaHidden: hideMedia && list(props.images).some(Boolean),
      };
    }
  }
  if (
    fields.has('media') &&
    (photoBlocks.has(component) || component === 'video')
  )
    return {
      ...block,
      props: {},
      privacyPlaceholder: component === 'video' ? 'video' : 'photo',
    };
  if (component === 'wreath') {
    return {
      ...block,
      props: {
        ...props,
        ...(fields.has('name')
          ? {
              groomName: maskName(props.groomName),
              brideName: maskName(props.brideName),
            }
          : {}),
        ...(fields.has('location') ? { hallName: '', hallAddress: '' } : {}),
      },
    };
  }
  if (component === 'phone' && (fields.has('phone') || fields.has('name')))
    return { ...block, props: redactPhones(props, fields) };
  if (component === 'account' && (fields.has('account') || fields.has('name')))
    return { ...block, props: redactAccounts(props, fields) };
  if (component === 'place' && fields.has('phone'))
    return {
      ...block,
      props: { ...props, placeTel: maskPhone(props.placeTel) },
    };
  if (component === 'notice' && fields.has('media')) {
    const notices = list(props.noticeList).map(record);
    if (notices.some(notice => list(notice.image).some(Boolean))) {
      return {
        ...block,
        props: {
          ...props,
          noticeList: notices.map(notice => ({ ...notice, image: [] })),
        },
        privacyMediaHidden: true,
      };
    }
  }
  if (profileBlocks.has(component) || component === 'myFamilyWedding') {
    return {
      ...block,
      props: redactProfile(props, component, fields),
      privacyMediaHidden: fields.has('media') && hasProfileImages(props),
    };
  }
  return block;
}

/** Derive the guest response without changing the owner's saved invitation. */
export function applyInvitationPrivacy(
  payload: GuestPayload,
  now = Date.now()
): GuestPayload {
  const fields = getActivePrivacyFields(
    payload.bulkData.invitationPrivacy,
    now
  );
  if (!fields.size) return payload;

  const hideMedia = fields.has('media');
  const hidePoster = fields.has('poster');
  const hideLocation = fields.has('location');
  const redactBirthdates = fields.has('birthday')
    ? createBirthdateRedactor(
        payload.blocks.map(block => block.props),
        [
          payload.bulkData.invitationPrivacy?.eventDate ?? '',
          ...payload.blocks.flatMap(({ component, props }) => {
            const data = record(props);
            if (component === 'calendar') return [string(data.date)];
            if (component === 'countdown')
              return [string(data.eventDateTime).slice(0, 10)];
            return [];
          }),
        ]
      )
    : undefined;

  const shareUrl = payload.shareUrl && {
    ...payload.shareUrl,
    // Editable share copy is free text and may repeat any of these fields.
    ...(hideCustomShareText(fields)
      ? { title: '', description: '', urlTitle: '', urlDescription: '' }
      : {}),
    ...(hideMedia ? { images: [], urlImage: [] } : {}),
    ...(hideLocation
      ? { showLocationButton: false, locationInfo: undefined }
      : {}),
  };

  return {
    ...payload,
    blocks: payload.blocks.map(block => {
      const redacted = redactBlock(block, fields);
      if (!redactBirthdates) return redacted;
      const props = redactBirthdates(redacted.props);
      return props === redacted.props ? redacted : { ...redacted, props };
    }),
    mainPoster: hidePoster
      ? { version: payload.mainPoster.version, objects: [] }
      : payload.mainPoster,
    shareUrl,
    renderHints: hideMedia || hidePoster ? undefined : payload.renderHints,
    activePrivacyFields: [...fields],
  };
}
