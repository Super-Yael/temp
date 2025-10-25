<template>
  <div class="card" @click="handleCardClick">
    <div class="card-image">
      <slot name="image">
        <img
          v-if="imageSrc"
          :src="imageSrc"
          :alt="imageAlt"
          class="card-image__media"
          loading="lazy"
        />
      </slot>
    </div>
    <div class="category" @click.stop="emit('select-category')">
      <slot name="category">
        {{ category }}
      </slot>
    </div>
    <div class="heading" @click.stop="emit('select-heading')">
      <slot name="heading">
        {{ heading }}
      </slot>
      <div v-if="hasAuthorContent" class="author">
        <slot name="author">
          By
          <span class="name" @click.stop="emit('select-author')">
            {{ authorName }}
          </span>
          <span v-if="authorMeta">{{ authorMeta }}</span>
        </slot>
      </div>
    </div>
    <div v-if="hasActions" class="card-actions" @click.stop>
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
/* global defineProps, defineEmits */
import { computed, useSlots } from 'vue';

const props = defineProps({
  imageSrc: {
    type: String,
    default: '',
  },
  imageAlt: {
    type: String,
    default: 'Card image',
  },
  category: {
    type: String,
    default: 'Category',
  },
  heading: {
    type: String,
    default: 'A descriptive heading',
  },
  authorName: {
    type: String,
    default: '',
  },
  authorMeta: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['select-card', 'select-category', 'select-heading', 'select-author']);
const slots = useSlots();

const hasAuthorContent = computed(() => {
  return Boolean(slots.author || props.authorName || props.authorMeta);
});

const hasActions = computed(() => Boolean(slots.actions));

function handleCardClick() {
  emit('select-card');
}
</script>

<style scoped>
.card {
  width: 190px;
  background: #fff;
  padding: 0.4em;
  border-radius: 6px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.card-image {
  background-color: rgb(236, 236, 236);
  width: 100%;
  height: 130px;
  border-radius: 6px 6px 0 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-image:hover {
  transform: scale(0.98);
}

.card-image__media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.category {
  text-transform: uppercase;
  font-size: 0.7em;
  font-weight: 600;
  color: rgb(63, 121, 230);
  padding: 10px 7px 0;
}

.category:hover {
  cursor: pointer;
}

.heading {
  font-weight: 600;
  color: rgb(88, 87, 87);
  padding: 7px;
}

.heading:hover {
  cursor: pointer;
}

.author {
  color: gray;
  font-weight: 400;
  font-size: 11px;
  padding-top: 20px;
}

.name {
  font-weight: 600;
}

.name:hover {
  cursor: pointer;
}

.card-actions {
  margin: 12px 7px 4px;
}
</style>
