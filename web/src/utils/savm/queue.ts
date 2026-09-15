export class DeliveryVan<T> {
  private pending: T[] = [];
  private onListener: ((ev: T) => void) | undefined = undefined;


  emit(ev: T) {
    if (this.onListener) {
      return (this.onListener)(ev);
    }

    this.pending.push(ev);
  }

  on(cb: (ev: T) => void) {
    this.onListener = cb;

    if (this.pending.length) {
      this.pending.splice(0)
        .forEach(cb);
    }
  }

  wipe() {
    this.onListener = undefined;
    this.pending = [];
  }
}