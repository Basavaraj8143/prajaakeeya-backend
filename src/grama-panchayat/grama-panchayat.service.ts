import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GramaPanchayat } from "./grama-panchayat.entity";
import { CreateGramaPanchayatDto } from "./dto/create-grama-panchayat.dto";

export interface GramaPanchayatFilters {
  state?: string;
  district?: string;
  taluk?: string;
  gpName?: string;
}

@Injectable()
export class GramaPanchayatService {
  constructor(
    @InjectRepository(GramaPanchayat)
    private readonly repo: Repository<GramaPanchayat>,
  ) {}

  async findBySrNo(srNo: number): Promise<GramaPanchayat> {
    const row = await this.repo.findOne({ where: { srNo } });
    if (!row)
      throw new NotFoundException(`Village with Sr.No ${srNo} not found`);
    return row;
  }

  async findAll(filters?: GramaPanchayatFilters) {
    // Refuse unbounded scans of the 30k-row table — callers must narrow
    // by at least state+district+taluk before fetching the village list.
    const hasFilters = !!(
      filters?.state ||
      filters?.district ||
      filters?.taluk ||
      filters?.gpName
    );
    if (!hasFilters) {
      return [];
    }

    const qb = this.repo
      .createQueryBuilder("gp")
      .select([
        'gp."Sr.No" AS "id"',
        'gp."State" AS "state"',
        'gp."District" AS "district"',
        'gp."Taluk" AS "taluk"',
        'gp."GP Name" AS "gpName"',
        'gp."Village Name" AS "villageName"',
        'gp."Village Code" AS "villageCode"',
        'gp."Population" AS "population"',
      ]);
    if (filters?.state)
      qb.andWhere('gp."State" = :state', { state: filters.state });
    if (filters?.district)
      qb.andWhere('gp."District" = :district', { district: filters.district });
    if (filters?.taluk)
      qb.andWhere('gp."Taluk" = :taluk', { taluk: filters.taluk });
    if (filters?.gpName)
      qb.andWhere('gp."GP Name" = :gpName', { gpName: filters.gpName });
    qb.orderBy('gp."Village Name"', "ASC");
    return qb.getRawMany();
  }

  async getStates(): Promise<string[]> {
    const rows = await this.repo
      .createQueryBuilder("gp")
      .select('DISTINCT gp."State"', "state")
      .orderBy('gp."State"', "ASC")
      .getRawMany();
    return rows.map((r) => r.state);
  }

  async getDistricts(state: string): Promise<string[]> {
    const rows = await this.repo
      .createQueryBuilder("gp")
      .select('DISTINCT gp."District"', "district")
      .where('gp."State" = :state', { state })
      .orderBy('gp."District"', "ASC")
      .getRawMany();
    return rows.map((r) => r.district);
  }

  async getTaluks(state: string, district: string): Promise<string[]> {
    const rows = await this.repo
      .createQueryBuilder("gp")
      .select('DISTINCT gp."Taluk"', "taluk")
      .where('gp."State" = :state', { state })
      .andWhere('gp."District" = :district', { district })
      .orderBy('gp."Taluk"', "ASC")
      .getRawMany();
    return rows.map((r) => r.taluk);
  }

  async getGPs(
    state: string,
    district: string,
    taluk: string,
  ): Promise<string[]> {
    const rows = await this.repo
      .createQueryBuilder("gp")
      .select('DISTINCT gp."GP Name"', "gpName")
      .where('gp."State" = :state', { state })
      .andWhere('gp."District" = :district', { district })
      .andWhere('gp."Taluk" = :taluk', { taluk })
      .orderBy('gp."GP Name"', "ASC")
      .getRawMany();
    return rows.map((r) => r.gpName);
  }

  async create(dto: CreateGramaPanchayatDto) {
    // Get next Sr.No
    const result = await this.repo
      .createQueryBuilder("gp")
      .select('MAX(gp."Sr.No")', "max")
      .getRawOne();
    const nextSrNo = (Number(result?.max) || 0) + 1;

    const entity = this.repo.create({
      srNo: nextSrNo,
      state: dto.state,
      district: dto.district,
      taluk: dto.taluk,
      gpName: dto.gpName,
      villageName: dto.villageName,
      villageCode: dto.villageCode,
      population: dto.population,
    });
    return this.repo.save(entity);
  }

  async update(srNo: number, dto: Partial<CreateGramaPanchayatDto>) {
    const row = await this.findBySrNo(srNo);
    if (dto.state !== undefined) row.state = dto.state;
    if (dto.district !== undefined) row.district = dto.district;
    if (dto.taluk !== undefined) row.taluk = dto.taluk;
    if (dto.gpName !== undefined) row.gpName = dto.gpName;
    if (dto.villageName !== undefined) row.villageName = dto.villageName;
    if (dto.villageCode !== undefined) row.villageCode = dto.villageCode;
    if (dto.population !== undefined) row.population = dto.population;
    return this.repo.save(row);
  }

  async delete(srNo: number) {
    const row = await this.findBySrNo(srNo);
    await this.repo.remove(row);
    return { message: `Village '${row.villageName}' (Sr.No ${srNo}) deleted` };
  }

  async getVillages(
    state: string,
    district: string,
    taluk: string,
    gpName: string,
  ) {
    const rows = await this.repo
      .createQueryBuilder("gp")
      .select([
        'gp."Sr.No" AS "id"',
        'gp."Village Name" AS "villageName"',
        'gp."Village Code" AS "villageCode"',
        'gp."Population" AS "population"',
      ])
      .where('gp."State" = :state', { state })
      .andWhere('gp."District" = :district', { district })
      .andWhere('gp."Taluk" = :taluk', { taluk })
      .andWhere('gp."GP Name" = :gpName', { gpName })
      .orderBy('gp."Village Name"', "ASC")
      .getRawMany();
    return rows;
  }
}
