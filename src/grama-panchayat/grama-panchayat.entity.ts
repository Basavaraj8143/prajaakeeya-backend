import { Entity, Column, PrimaryColumn, Index } from "typeorm";

@Index("idx_gp_lookup", ["state", "district", "taluk", "gpName"])
@Entity("grama_panchayat")
export class GramaPanchayat {
  @PrimaryColumn({ name: "Sr.No", type: "bigint" })
  srNo!: number;

  @Column({ name: "State" })
  state!: string;

  @Column({ name: "District" })
  district!: string;

  @Column({ name: "Taluk" })
  taluk!: string;

  @Column({ name: "GP Name" })
  gpName!: string;

  @Column({ name: "Village Name" })
  villageName!: string;

  @Column({ name: "Village Code", nullable: true })
  villageCode?: string;

  @Column({ name: "Population", nullable: true })
  population?: string;
}
