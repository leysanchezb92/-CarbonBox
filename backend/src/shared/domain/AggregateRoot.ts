export abstract class AggregateRoot<TProps extends { id: string }> {
  protected props: TProps;

  protected constructor(props: TProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }
}
