import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('profile')
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  firstName: string;

  @Column({ type: 'varchar', length: 50 })
  lastName: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  nickname: string;

  @Column({ type: 'varchar', length: 20, default: 'user' })
  role: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @CreateDateColumn()
  createdAt: Date;
}
